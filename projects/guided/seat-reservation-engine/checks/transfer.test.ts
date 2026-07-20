import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";

import { ReservationRepository } from "../src/services.js";
import { makeTestLayer } from "./support.js";

describe("Перенос: составной accessibility resource", () => {
  it("удерживает место и устройство вместе либо не удерживает ничего", async () => {
    const program = Effect.gen(function* () {
      const repository = yield* ReservationRepository;
      yield* repository.holdAccessible(
        "existing",
        ["B1"],
        "hearing-1",
        10_000,
      );
      const attempted = yield* repository
        .holdAccessible("target", ["A1"], "hearing-1", 10_000)
        .pipe(Effect.either);
      const snapshot = yield* repository.snapshot;
      return { attempted, snapshot };
    });

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(
          makeTestLayer({
            seats: ["A1", "B1"],
            aids: ["hearing-1"],
          }),
        ),
      ),
    );

    expect(Either.isLeft(result.attempted)).toBe(true);
    expect(result.attempted).toMatchObject({
      left: { _tag: "AidUnavailable", aid: "hearing-1" },
    });
    expect(result.snapshot.availableSeats).toEqual(["A1"]);
    expect(result.snapshot.heldSeats).toEqual(["B1"]);
    expect(
      result.snapshot.reservations.some(
        (reservation) => reservation.id === "target",
      ),
    ).toBe(false);
  });
});
