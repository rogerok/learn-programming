import { randomUUID } from "node:crypto";

import { Effect, Ref } from "effect";

import type {
  AidId,
  BookingEvent,
  Reservation,
  ReservationId,
  SeatId,
  VenueSnapshot,
} from "./domain.js";
import type { BookingError } from "./errors.js";
import { ReservationRepository, type ReservationRepositoryService } from "./services.js";

export const listVenue: Effect.Effect<VenueSnapshot, never, ReservationRepositoryService> =
  Effect.flatMap(ReservationRepository, (repository) => repository.snapshot);

/**
 * Этап 3 — learner seam: use cases пока читают clock и UUID из Node globals,
 * а confirm обходит PaymentGateway. Contracts и test Layers уже находятся в
 * services.ts и checks/support.ts; изменяется dependency wiring этих функций.
 */
export const createHold = (
  seats: ReadonlyArray<SeatId>,
  durationMs: number,
): Effect.Effect<Reservation, BookingError, ReservationRepositoryService> =>
  Effect.gen(function* () {
    const repository = yield* ReservationRepository;
    const reservationId = randomUUID();
    const expiresAt = Date.now() + durationMs;
    return yield* repository.holdSeats(reservationId, seats, expiresAt);
  });

export const createAccessibleHold = (
  seats: ReadonlyArray<SeatId>,
  aid: AidId,
  durationMs: number,
): Effect.Effect<Reservation, BookingError, ReservationRepositoryService> =>
  Effect.gen(function* () {
    const repository = yield* ReservationRepository;
    const reservationId = randomUUID();
    const expiresAt = Date.now() + durationMs;
    return yield* repository.holdAccessible(reservationId, seats, aid, expiresAt);
  });

export const confirmReservation = (
  reservationId: ReservationId,
  amount: number,
): Effect.Effect<Reservation, BookingError, ReservationRepositoryService> =>
  Effect.gen(function* () {
    if (!Number.isFinite(amount) || amount <= 0) {
      return yield* Effect.die(new Error("Payment amount must be a positive finite number"));
    }
    const repository = yield* ReservationRepository;
    return yield* repository.confirm(reservationId);
  });

export const releaseReservation = (
  reservationId: ReservationId,
): Effect.Effect<void, never, ReservationRepositoryService> =>
  Effect.flatMap(ReservationRepository, (repository) => repository.release(reservationId));

/**
 * Этап 4 — learner seam: baseline создаёт hold, но не связывает release и
 * expiration fiber со Scope. Сохраните обе публичные сигнатуры.
 */
export const withTemporaryHold = <A, E, R>(
  seats: ReadonlyArray<SeatId>,
  durationMs: number,
  use: (reservation: Reservation) => Effect.Effect<A, E, R>,
): Effect.Effect<A, E | BookingError, R | ReservationRepositoryService> =>
  Effect.flatMap(createHold(seats, durationMs), use);

/**
 * Вторая точка этапа 4: expiration пока не supervised текущим Scope.
 */
export const openTimedHold = (
  seats: ReadonlyArray<SeatId>,
  durationMs: number,
): Effect.Effect<Reservation, BookingError, ReservationRepositoryService> =>
  createHold(seats, durationMs);

export interface BookingRequest {
  readonly seats: ReadonlyArray<SeatId>;
  readonly amount: number;
  readonly durationMs: number;
}

export type BookingOutcome =
  | { readonly _tag: "Booked"; readonly reservation: Reservation }
  | {
      readonly _tag: "Rejected";
      readonly seats: ReadonlyArray<SeatId>;
      readonly reason: unknown;
    };

export interface BookingBatchOptions {
  readonly paymentConcurrency: number;
  readonly workerCount: number;
  readonly queueCapacity: number;
  readonly subscribers: ReadonlyArray<(event: BookingEvent) => Effect.Effect<void>>;
}

export interface BookingBatchResult {
  readonly outcomes: ReadonlyArray<BookingOutcome>;
  readonly events: ReadonlyArray<BookingEvent>;
}

export const processBookingRequests = (
  requests: ReadonlyArray<BookingRequest>,
  options: BookingBatchOptions,
): Effect.Effect<BookingBatchResult, never, ReservationRepositoryService> =>
  Effect.gen(function* () {
    const events = yield* Ref.make<ReadonlyArray<BookingEvent>>([]);

    const publish = (event: BookingEvent) =>
      Effect.gen(function* () {
        yield* Ref.update(events, (current) => [...current, event]);
        yield* Effect.forEach(options.subscribers, (subscriber) => subscriber(event), {
          discard: true,
        });
      });

    const outcomes = yield* Effect.forEach(requests, (request) =>
      Effect.gen(function* () {
        const reservation = yield* createHold(request.seats, request.durationMs);
        yield* publish({ _tag: "ReservationHeld", reservation });
        const confirmed = yield* confirmReservation(reservation.id, request.amount);
        yield* publish({ _tag: "ReservationConfirmed", reservation: confirmed });
        return { _tag: "Booked" as const, reservation: confirmed };
      }).pipe(
        Effect.catchAll((reason) => {
          const event: BookingEvent = {
            _tag: "ReservationRejected",
            seats: request.seats,
            reason,
          };
          return Effect.as(publish(event), {
            _tag: "Rejected" as const,
            seats: request.seats,
            reason,
          });
        }),
      ),
    );

    return { outcomes, events: yield* Ref.get(events) };
  });

export interface BookingProcessor {
  readonly submit: (
    request: BookingRequest,
  ) => Effect.Effect<BookingOutcome, never, ReservationRepositoryService>;
  readonly subscribe: (
    subscriber: (event: BookingEvent) => Effect.Effect<void>,
  ) => Effect.Effect<void>;
  readonly eventLog: Effect.Effect<ReadonlyArray<BookingEvent>>;
}

/**
 * Этап 5 — learner seam: baseline обрабатывает submit немедленно и сохраняет
 * публичный BookingProcessor, но пока не использует Queue, Deferred, PubSub,
 * worker fibers и concurrency permit. Подробная граница описана в GUIDE.md.
 */
export const makeBookingProcessor = (
  options: Omit<BookingBatchOptions, "subscribers">,
): Effect.Effect<BookingProcessor, never, ReservationRepositoryService> =>
  Effect.gen(function* () {
    if (
      !Number.isInteger(options.workerCount) ||
      options.workerCount < 1 ||
      !Number.isInteger(options.queueCapacity) ||
      options.queueCapacity < 1 ||
      !Number.isInteger(options.paymentConcurrency) ||
      options.paymentConcurrency < 1
    ) {
      return yield* Effect.die(new Error("Processor limits must be positive integers"));
    }
    const subscribers = yield* Ref.make<
      ReadonlyArray<(event: BookingEvent) => Effect.Effect<void>>
    >([]);
    const events = yield* Ref.make<ReadonlyArray<BookingEvent>>([]);

    const publish = (event: BookingEvent) =>
      Effect.gen(function* () {
        yield* Ref.update(events, (current) => [...current, event]);
        const currentSubscribers = yield* Ref.get(subscribers);
        yield* Effect.forEach(currentSubscribers, (subscriber) => subscriber(event), {
          discard: true,
        });
      });

    const submit = (
      request: BookingRequest,
    ): Effect.Effect<BookingOutcome, never, ReservationRepositoryService> =>
      Effect.gen(function* () {
        const reservation = yield* createHold(request.seats, request.durationMs);
        yield* publish({ _tag: "ReservationHeld", reservation });
        const confirmed = yield* confirmReservation(reservation.id, request.amount);
        yield* publish({
          _tag: "ReservationConfirmed",
          reservation: confirmed,
        });
        return { _tag: "Booked" as const, reservation: confirmed };
      }).pipe(
        Effect.catchAll((reason) => {
          const event: BookingEvent = {
            _tag: "ReservationRejected",
            seats: request.seats,
            reason,
          };
          return Effect.as(publish(event), {
            _tag: "Rejected" as const,
            seats: request.seats,
            reason,
          });
        }),
      );

    return {
      submit,
      subscribe: (subscriber) => Ref.update(subscribers, (current) => [...current, subscriber]),
      eventLog: Ref.get(events),
    };
  });
