import { Effect, Either, Fiber, Option } from "effect";
import { describe, expect, it } from "vitest";

import { ReservationRepository } from "../src/services.js";
import { makeTestLayer } from "./support.js";

describe("Этап 6: STM и атомарное состояние", () => {
  it("не допускает double booking при конкурентном hold одного места", async () => {
    const program = Effect.gen(function* () {
      const repository = yield* ReservationRepository;
      const outcomes = yield* Effect.all(
        [
          repository.holdSeats("r-1", ["A1"], 10_000).pipe(Effect.either),
          repository.holdSeats("r-2", ["A1"], 10_000).pipe(Effect.either),
        ],
        { concurrency: "unbounded" },
      );
      const snapshot = yield* repository.snapshot;
      return { outcomes, snapshot };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(makeTestLayer({ seats: ["A1"] }))),
    );

    expect(result.outcomes.filter(Either.isRight)).toHaveLength(1);
    expect(result.outcomes.filter(Either.isLeft)).toHaveLength(1);
    const rejected = result.outcomes.find(Either.isLeft);
    expect(rejected?.left).toMatchObject({ _tag: "SeatUnavailable" });
    expect(result.snapshot.heldSeats).toEqual(["A1"]);
    expect(
      result.snapshot.reservations.filter(
        (reservation) => reservation.status === "held",
      ),
    ).toHaveLength(1);
  });

  it("удерживает группу мест по принципу all-or-none", async () => {
    const program = Effect.gen(function* () {
      const repository = yield* ReservationRepository;
      yield* repository.holdSeats("existing", ["A2"], 10_000);
      const group = yield* repository
        .holdSeats("group", ["A1", "A2"], 10_000)
        .pipe(Effect.either);
      const snapshot = yield* repository.snapshot;
      return { group, snapshot };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(makeTestLayer({ seats: ["A1", "A2"] }))),
    );

    expect(Either.isLeft(result.group)).toBe(true);
    expect(result.snapshot.availableSeats).toEqual(["A1"]);
    expect(result.snapshot.heldSeats).toEqual(["A2"]);
    expect(
      result.snapshot.reservations.some(
        (reservation) => reservation.id === "group",
      ),
    ).toBe(false);
  });

  it("приостанавливает STM-транзакцию до освобождения места", async () => {
    const program = Effect.gen(function* () {
      const repository = yield* ReservationRepository;
      yield* repository.holdSeats("first", ["A1"], 10_000);
      const waiter = yield* Effect.fork(
        repository.waitAndHoldSeats("second", ["A1"], 20_000),
      );
      yield* Effect.yieldNow();
      const beforeRelease = yield* Fiber.poll(waiter);
      yield* repository.release("first");
      const second = yield* Fiber.join(waiter);
      return { beforeRelease, second };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(makeTestLayer({ seats: ["A1"] }))),
    );

    expect(Option.isNone(result.beforeRelease)).toBe(true);
    expect(result.second).toMatchObject({
      id: "second",
      seats: ["A1"],
      status: "held",
    });
  });
});
