import { it } from "@effect/vitest";
import {
  Chunk,
  Deferred,
  Effect,
  Fiber,
  Option,
  Ref,
  Stream,
  TestClock,
} from "effect";
import { describe, expect } from "vitest";

import type { BookingEvent, Reservation } from "../src/domain.js";
import {
  batchBookingEvents,
  shareBookingEvents,
} from "../src/operations/event-stream.js";

const reservation = (id: string): Reservation => ({
  id,
  seats: [id],
  aids: [],
  expiresAt: 10_000,
  status: "held",
});

const held = (id: string): BookingEvent => ({
  _tag: "ReservationHeld",
  reservation: reservation(id),
});

describe("Итерация 2 · Этап 1: Stream pipeline", () => {
  it.effect("формирует batch по размеру", () =>
    Effect.gen(function* () {
      const batches = yield* Stream.fromIterable([
        held("A1"),
        held("A2"),
        held("A3"),
        held("A4"),
        held("A5"),
      ]).pipe(
        (source) =>
          batchBookingEvents(source, {
            maxBatchSize: 3,
            within: "1 hour",
          }),
        Stream.runCollect,
      );

      expect(Chunk.toReadonlyArray(batches).map((batch) => batch.length)).toEqual(
        [3, 2],
      );
    }),
  );

  it.effect("flush-ит неполный batch только после временной границы", () =>
    Effect.gen(function* () {
      const pending: Stream.Stream<BookingEvent> = Stream.make(
        held("A1"),
        held("A2"),
      ).pipe(Stream.concat(Stream.never));
      const firstBatch = batchBookingEvents(pending, {
        maxBatchSize: 64,
        within: "1 second",
      }).pipe(Stream.runHead);

      const fiber = yield* Effect.fork(firstBatch);
      yield* Effect.yieldNow();

      const beforeDeadline = yield* Fiber.poll(fiber);
      expect(Option.isNone(beforeDeadline)).toBe(true);

      yield* TestClock.adjust("1 second");
      const batch = Option.getOrThrow(yield* Fiber.join(fiber));
      expect(
        batch.map((event) =>
          event._tag === "ReservationHeld"
            ? event.reservation.id
            : "unexpected-event",
        ),
      ).toEqual(["A1", "A2"]);
    }),
  );

  it.scoped("делит один upstream между одновременными consumers", () =>
    Effect.gen(function* () {
        const acquisitions = yield* Ref.make(0);
        const firstAcquired = yield* Deferred.make<void>();
        const release = yield* Deferred.make<void>();

        const sourceEffect: Effect.Effect<Stream.Stream<BookingEvent>> =
          Effect.gen(function* () {
            yield* Ref.update(acquisitions, (count) => count + 1);
            yield* Deferred.succeed(firstAcquired, undefined);
            yield* Deferred.await(release);
            return Stream.make(held("A1")).pipe(Stream.concat(Stream.never));
          });
        const source = Stream.unwrap(sourceEffect);

        const shared = yield* shareBookingEvents(source, {
          capacity: 16,
          replay: 1,
          idleTimeToLive: "30 seconds",
        });

        const consumers = yield* Effect.fork(
          Effect.all([Stream.runHead(shared), Stream.runHead(shared)], {
            concurrency: "unbounded",
          }),
        );

        yield* Deferred.await(firstAcquired);
        yield* Effect.repeatN(Effect.yieldNow(), 5);
        yield* Deferred.succeed(release, undefined);
        const results = yield* Fiber.join(consumers);

        expect(results.every(Option.isSome)).toBe(true);
        expect(yield* Ref.get(acquisitions)).toBe(1);
    }),
  );
});
