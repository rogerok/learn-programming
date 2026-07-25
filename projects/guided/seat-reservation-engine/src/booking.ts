import { randomUUID } from "node:crypto";

import { Deferred, Effect, PubSub, Queue, Ref, Scope } from "effect";

import type {
  AidId,
  BookingEvent,
  Reservation,
  ReservationId,
  SeatId,
  VenueSnapshot,
} from "./domain.js";
import { type BookingError, PaymentDeclined, ReservationNotFound } from "./errors.js";
import {
  PaymentGateway,
  type PaymentGatewayService,
  ReservationClock,
  type ReservationClockService,
  ReservationIdGenerator,
  type ReservationIdGeneratorService,
  ReservationRepository,
  type ReservationRepositoryService,
} from "./services.js";

export const listVenue: Effect.Effect<VenueSnapshot, never, ReservationRepositoryService> =
  Effect.flatMap(ReservationRepository, (repository) => repository.snapshot);

export const createHold = (seats: ReadonlyArray<SeatId>, durationMs: number) =>
  Effect.gen(function* () {
    const repository = yield* ReservationRepository;
    const idGenerator = yield* ReservationIdGenerator;
    const clock = yield* ReservationClock;
    const reservationId = yield* idGenerator.next;

    const now = yield* clock.now;
    const expiresAt = now + durationMs;

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

const confirmReservationUsing = (
  reservationId: ReservationId,
  amount: number,
  runCharge: PaymentGatewayService["charge"],
): Effect.Effect<
  Reservation,
  PaymentDeclined | ReservationNotFound,
  ReservationRepositoryService
> =>
  Effect.gen(function* () {
    if (!Number.isFinite(amount) || amount <= 0) {
      return yield* Effect.fail(
        new PaymentDeclined({
          reservationId,
          reason: "Payment amount must be a positive finite number",
        }),
      );
    }

    const repository = yield* ReservationRepository;

    yield* runCharge(reservationId, amount);

    return yield* repository.confirm(reservationId);
  });

export const confirmReservation = (
  reservationId: ReservationId,
  amount: number,
): Effect.Effect<Reservation, BookingError, ReservationRepositoryService | PaymentGatewayService> =>
  Effect.gen(function* () {
    const payment = yield* PaymentGateway;

    return yield* confirmReservationUsing(reservationId, amount, payment.charge);
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
): Effect.Effect<
  A,
  E | BookingError,
  R | ReservationRepositoryService | ReservationIdGeneratorService | ReservationClockService
> => Effect.acquireUseRelease(createHold(seats, durationMs), use, (r) => releaseReservation(r.id));

/**
 * Вторая точка этапа 4: expiration пока не supervised текущим Scope.
 */
export const openTimedHold = (
  seats: ReadonlyArray<SeatId>,
  durationMs: number,
): Effect.Effect<
  Reservation,
  BookingError,
  | ReservationRepositoryService
  | ReservationIdGeneratorService
  | ReservationClockService
  | Scope.Scope
> =>
  createHold(seats, durationMs).pipe(
    Effect.flatMap((r) =>
      Effect.gen(function* () {
        yield* Effect.forkScoped(
          Effect.sleep(`${durationMs} millis`).pipe(Effect.andThen(releaseReservation(r.id))),
        );
        return r;
      }),
    ),
  );

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
): Effect.Effect<
  BookingBatchResult,
  never,
  | ReservationRepositoryService
  | ReservationIdGeneratorService
  | ReservationClockService
  | PaymentGatewayService
> =>
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
  ) => Effect.Effect<
    BookingOutcome,
    never,
    | ReservationRepositoryService
    | ReservationClockService
    | ReservationIdGeneratorService
    | PaymentGatewayService
  >;
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
): Effect.Effect<
  BookingProcessor,
  never,
  | ReservationRepositoryService
  | PaymentGatewayService
  | ReservationIdGeneratorService
  | ReservationClockService
  | Scope.Scope
> =>
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
    const events = yield* Ref.make<ReadonlyArray<BookingEvent>>([]);
    const scope = yield* Effect.scope;

    const pubsub = yield* PubSub.bounded<BookingEvent>(options.paymentConcurrency);
    const paymentSem = yield* Effect.makeSemaphore(options.paymentConcurrency);
    const queue = yield* Queue.bounded<{
      request: BookingRequest;
      reply: Deferred.Deferred<BookingOutcome>;
    }>(options.queueCapacity);

    const publish = (event: BookingEvent) =>
      Effect.gen(function* () {
        yield* Ref.update(events, (es) => [...es, event]);

        yield* PubSub.publish(pubsub, event);
      });

    const subscribe = (cb: (event: BookingEvent) => Effect.Effect<void>) =>
      Effect.gen(function* () {
        const subscription = yield* Scope.extend(PubSub.subscribe(pubsub), scope);

        const consumer = Effect.gen(function* () {
          const event = yield* subscription.take;
          yield* cb(event);
        }).pipe(Effect.forever);
        yield* Effect.forkIn(consumer, scope);
      });

    const worker: Effect.Effect<
      never,
      never,
      | ReservationRepositoryService
      | PaymentGatewayService
      | ReservationIdGeneratorService
      | ReservationClockService
      | Scope.Scope
    > = Effect.forever(
      Effect.gen(function* () {
        const value = yield* queue.take;
        const booked = yield* book(value.request);

        yield* Deferred.succeed(value.reply, booked);
      }),
    );

    const loop = Effect.forEach(Array.from({ length: options.workerCount }), () =>
      Effect.forkScoped(worker),
    );

    yield* loop;

    const book = (
      request: BookingRequest,
    ): Effect.Effect<
      BookingOutcome,
      never,
      | ReservationRepositoryService
      | ReservationClockService
      | ReservationIdGeneratorService
      | PaymentGatewayService
      | Scope.Scope
    > =>
      Effect.gen(function* () {
        const reservation = yield* createHold(request.seats, request.durationMs);
        yield* publish({ _tag: "ReservationHeld", reservation });

        const payment = yield* PaymentGateway;

        const confirmed = yield* confirmReservationUsing(
          reservation.id,
          request.amount,
          (reservationId, amount) =>
            paymentSem.withPermits(1)(payment.charge(reservationId, amount)),
        );

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

    const submit = (request: BookingRequest): Effect.Effect<BookingOutcome> =>
      Effect.gen(function* () {
        const reply = yield* Deferred.make<BookingOutcome>();

        yield* Queue.offer(queue, { request, reply });

        return yield* Deferred.await(reply);
      });

    return {
      submit,
      subscribe,
      eventLog: Ref.get(events),
    };
  });
