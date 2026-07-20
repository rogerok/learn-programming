import { randomUUID } from "node:crypto";

import { Context, Effect, Layer, Ref } from "effect";

import type {
  AidId,
  Reservation,
  ReservationId,
  SeatId,
  VenueSnapshot,
} from "./domain.js";
import {
  AidUnavailable,
  PaymentDeclined,
  ReservationNotFound,
  SeatUnavailable,
} from "./errors.js";

interface MutableVenueState {
  readonly seats: Map<SeatId, "available" | "held" | "booked">;
  readonly aids: Map<AidId, "available" | "held" | "booked">;
  readonly reservations: Map<ReservationId, Reservation>;
}

const copyState = (state: MutableVenueState): MutableVenueState => ({
  seats: new Map(state.seats),
  aids: new Map(state.aids),
  reservations: new Map(state.reservations),
});

const toSnapshot = (state: MutableVenueState): VenueSnapshot => ({
  availableSeats: [...state.seats]
    .filter(([, status]) => status === "available")
    .map(([seat]) => seat)
    .sort(),
  heldSeats: [...state.seats]
    .filter(([, status]) => status === "held")
    .map(([seat]) => seat)
    .sort(),
  bookedSeats: [...state.seats]
    .filter(([, status]) => status === "booked")
    .map(([seat]) => seat)
    .sort(),
  availableAids: [...state.aids]
    .filter(([, status]) => status === "available")
    .map(([aid]) => aid)
    .sort(),
  reservations: [...state.reservations.values()].map((reservation) => ({
    ...reservation,
    seats: [...reservation.seats],
    aids: [...reservation.aids],
  })),
});

export interface ReservationRepositoryService {
  readonly snapshot: Effect.Effect<VenueSnapshot>;
  readonly holdSeats: (
    reservationId: ReservationId,
    seats: ReadonlyArray<SeatId>,
    expiresAt: number,
  ) => Effect.Effect<Reservation, SeatUnavailable>;
  readonly waitAndHoldSeats: (
    reservationId: ReservationId,
    seats: ReadonlyArray<SeatId>,
    expiresAt: number,
  ) => Effect.Effect<Reservation, SeatUnavailable>;
  readonly holdAccessible: (
    reservationId: ReservationId,
    seats: ReadonlyArray<SeatId>,
    aid: AidId,
    expiresAt: number,
  ) => Effect.Effect<Reservation, SeatUnavailable | AidUnavailable>;
  readonly confirm: (
    reservationId: ReservationId,
  ) => Effect.Effect<Reservation, ReservationNotFound>;
  readonly release: (reservationId: ReservationId) => Effect.Effect<void>;
}

export const ReservationRepository =
  Context.GenericTag<ReservationRepositoryService>(
    "SeatReservation/ReservationRepository",
  );

export interface ReservationClockService {
  readonly now: Effect.Effect<number>;
}

export const ReservationClock = Context.GenericTag<ReservationClockService>(
  "SeatReservation/ReservationClock",
);

export interface ReservationIdGeneratorService {
  readonly next: Effect.Effect<ReservationId>;
}

export const ReservationIdGenerator =
  Context.GenericTag<ReservationIdGeneratorService>(
    "SeatReservation/ReservationIdGenerator",
  );

export interface PaymentGatewayService {
  readonly charge: (
    reservationId: ReservationId,
    amount: number,
  ) => Effect.Effect<void, PaymentDeclined>;
}

export const PaymentGateway = Context.GenericTag<PaymentGatewayService>(
  "SeatReservation/PaymentGateway",
);

/**
 * Этапы 2 и 6 — learner seam repository:
 * - этап 2 переводит conflict из defect в SeatUnavailable;
 * - этап 6 заменяет раздельный Ref read/check/write на одну STM transaction.
 * Transfer отдельно делает holdAccessible атомарным для seats и aid.
 */
export const makeReservationRepository = (
  seatIds: ReadonlyArray<SeatId>,
  aidIds: ReadonlyArray<AidId> = [],
): Effect.Effect<ReservationRepositoryService> =>
  Effect.gen(function* () {
    const state = yield* Ref.make<MutableVenueState>({
      seats: new Map(seatIds.map((seat) => [seat, "available"] as const)),
      aids: new Map(aidIds.map((aid) => [aid, "available"] as const)),
      reservations: new Map(),
    });

    const snapshot = Ref.get(state).pipe(Effect.map(toSnapshot));

    // Этап 2: эта операция пока сообщает conflict через Effect.die.
    const holdSeats: ReservationRepositoryService["holdSeats"] = (
      reservationId,
      seats,
      expiresAt,
    ) =>
      Effect.gen(function* () {
        const observed = yield* Ref.get(state);
        const unavailable = seats.filter(
          (seat) => observed.seats.get(seat) !== "available",
        );

        if (unavailable.length > 0) {
          return yield* Effect.die(
            new Error(`Seats are unavailable: ${unavailable.join(", ")}`),
          );
        }

        // Этап 6: yield делает baseline race наблюдаемой; исправляется transaction,
        // а не удалением yield или добавлением process-local mutex.
        yield* Effect.yieldNow();

        const reservation: Reservation = {
          id: reservationId,
          seats: [...seats],
          aids: [],
          expiresAt,
          status: "held",
        };
        yield* Ref.update(state, (current) => {
          const next = copyState(current);
          for (const seat of seats) next.seats.set(seat, "held");
          next.reservations.set(reservationId, reservation);
          return next;
        });
        return reservation;
      });

    // Transfer: baseline удерживает seats раньше aid и поэтому нарушает all-or-none.
    const holdAccessible: ReservationRepositoryService["holdAccessible"] = (
      reservationId,
      seats,
      aid,
      expiresAt,
    ) =>
      Effect.gen(function* () {
        const reservation = yield* holdSeats(
          reservationId,
          seats,
          expiresAt,
        );
        const observed = yield* Ref.get(state);

        if (observed.aids.get(aid) !== "available") {
          return yield* new AidUnavailable({ aid });
        }

        const next = copyState(observed);
        next.aids.set(aid, "held");
        const accessible = { ...reservation, aids: [aid] };
        next.reservations.set(reservationId, accessible);
        yield* Ref.set(state, next);
        return accessible;
      });

    const confirm: ReservationRepositoryService["confirm"] = (reservationId) =>
      Effect.gen(function* () {
        const observed = yield* Ref.get(state);
        const reservation = observed.reservations.get(reservationId);
        if (!reservation) {
          return yield* new ReservationNotFound({ reservationId });
        }

        const next = copyState(observed);
        const confirmed: Reservation = {
          ...reservation,
          status: "confirmed",
        };
        for (const seat of reservation.seats) next.seats.set(seat, "booked");
        for (const aid of reservation.aids) next.aids.set(aid, "booked");
        next.reservations.set(reservationId, confirmed);
        yield* Ref.set(state, next);
        return confirmed;
      });

    const release: ReservationRepositoryService["release"] = (reservationId) =>
      Ref.update(state, (observed) => {
        const reservation = observed.reservations.get(reservationId);
        if (!reservation || reservation.status !== "held") return observed;

        const next = copyState(observed);
        for (const seat of reservation.seats) next.seats.set(seat, "available");
        for (const aid of reservation.aids) next.aids.set(aid, "available");
        next.reservations.set(reservationId, {
          ...reservation,
          status: "cancelled",
        });
        return next;
      });

    // Этап 6: waitAndHoldSeats пока alias и не имеет transactional retry semantics.
    return {
      snapshot,
      holdSeats,
      waitAndHoldSeats: holdSeats,
      holdAccessible,
      confirm,
      release,
    };
  });

export const makeReservationRepositoryLayer = (
  seatIds: ReadonlyArray<SeatId>,
  aidIds: ReadonlyArray<AidId> = [],
) =>
  Layer.effect(
    ReservationRepository,
    makeReservationRepository(seatIds, aidIds),
  );

export const ReservationClockLive = Layer.succeed(ReservationClock, {
  now: Effect.sync(() => Date.now()),
});

export const ReservationIdGeneratorLive = Layer.succeed(
  ReservationIdGenerator,
  { next: Effect.sync(() => randomUUID()) },
);

export const PaymentGatewayLive = Layer.succeed(PaymentGateway, {
  charge: () => Effect.void,
});

export const SupportServicesLive = Layer.mergeAll(
  ReservationClockLive,
  ReservationIdGeneratorLive,
  PaymentGatewayLive,
);
