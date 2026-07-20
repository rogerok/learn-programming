import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";

import {
  confirmReservation,
  createHold,
} from "../src/booking.js";
import { makeTestLayer } from "./support.js";

describe("Этап 2: actionable typed errors", () => {
  it("возвращает SeatUnavailable в E, а не превращает конфликт в defect", async () => {
    const program = Effect.gen(function* () {
      yield* createHold(["A1"], 1_000);
      return yield* createHold(["A1"], 1_000).pipe(Effect.either);
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(makeTestLayer({ seats: ["A1"] }))),
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left).toMatchObject({
        _tag: "SeatUnavailable",
        seats: ["A1"],
      });
    }
  });

  it("позволяет точечно восстановиться после SeatUnavailable", async () => {
    const program = Effect.gen(function* () {
      yield* createHold(["A1"], 1_000);
      return yield* createHold(["A1"], 1_000).pipe(
        Effect.catchTag("SeatUnavailable", () =>
          Effect.succeed("предложить другое место" as const),
        ),
      );
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(makeTestLayer({ seats: ["A1"] }))),
    );

    expect(result).toBe("предложить другое место");
  });

  it("сохраняет ReservationNotFound отдельной веткой ошибки", async () => {
    const result = await Effect.runPromise(
      confirmReservation("missing", 500).pipe(
        Effect.either,
        Effect.provide(makeTestLayer()),
      ),
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left).toMatchObject({
        _tag: "ReservationNotFound",
        reservationId: "missing",
      });
    }
  });
});
