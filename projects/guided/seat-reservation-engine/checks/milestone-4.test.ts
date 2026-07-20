import { Deferred, Effect, Either, Fiber } from "effect";
import { describe, expect, it } from "vitest";

import {
  listVenue,
  openTimedHold,
  withTemporaryHold,
} from "../src/booking.js";
import { makeTestLayer } from "./support.js";

describe("Этап 4: Scope и finalizers", () => {
  it("освобождает hold, когда use-зона завершается ошибкой", async () => {
    const program = Effect.gen(function* () {
      const useResult = yield* withTemporaryHold(
        ["A1"],
        10_000,
        () => Effect.fail("use failed" as const),
      ).pipe(Effect.either);
      const snapshot = yield* listVenue;
      return { useResult, snapshot };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(makeTestLayer({ seats: ["A1"] }))),
    );

    expect(Either.isLeft(result.useResult)).toBe(true);
    expect(result.snapshot.availableSeats).toEqual(["A1"]);
    expect(result.snapshot.heldSeats).toEqual([]);
  });

  it("запускает finalizer при interruption use-зоны", async () => {
    const program = Effect.gen(function* () {
      const started = yield* Deferred.make<void>();
      const fiber = yield* Effect.fork(
        withTemporaryHold(["A1"], 10_000, () =>
          Deferred.succeed(started, undefined).pipe(
            Effect.andThen(Effect.never),
          ),
        ),
      );

      yield* Deferred.await(started);
      const during = yield* listVenue;
      yield* Fiber.interrupt(fiber);
      const after = yield* listVenue;
      return { during, after };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(makeTestLayer({ seats: ["A1"] }))),
    );

    expect(result.during.heldSeats).toEqual(["A1"]);
    expect(result.after.availableSeats).toEqual(["A1"]);
    expect(result.after.heldSeats).toEqual([]);
  });

  it("освобождает неподтверждённый timed hold после deadline", async () => {
    const program = Effect.scoped(
      Effect.gen(function* () {
        yield* openTimedHold(["A2"], 20);
        const during = yield* listVenue;
        yield* Effect.sleep("60 millis");
        const after = yield* listVenue;
        return { during, after };
      }),
    );

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(makeTestLayer({ seats: ["A2"] }))),
    );

    expect(result.during.heldSeats).toEqual(["A2"]);
    expect(result.after.availableSeats).toEqual(["A2"]);
    expect(result.after.heldSeats).toEqual([]);
  });
});
