import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";

import {
  confirmReservation,
  createHold,
  listVenue,
} from "../src/booking.js";
import { PaymentDeclined } from "../src/errors.js";
import { makeTestLayer } from "./support.js";

describe("Этап 3: services и Layer", () => {
  it("берёт id и время из подставленного окружения", async () => {
    const reservation = await Effect.runPromise(
      createHold(["A1"], 2_500).pipe(
        Effect.provide(
          makeTestLayer({
            now: 10_000,
            ids: ["fixed-reservation"],
          }),
        ),
      ),
    );

    expect(reservation).toMatchObject({
      id: "fixed-reservation",
      expiresAt: 12_500,
      seats: ["A1"],
      status: "held",
    });
  });

  it("подменяет PaymentGateway без изменения booking workflow", async () => {
    const layer = makeTestLayer({
      ids: ["declined-reservation"],
      charge: (reservationId) =>
        Effect.fail(
          new PaymentDeclined({
            reservationId,
            reason: "test decline",
          }),
        ),
    });

    const program = Effect.gen(function* () {
      const hold = yield* createHold(["A1"], 5_000);
      const confirmation = yield* confirmReservation(hold.id, 1_500).pipe(
        Effect.either,
      );
      const snapshot = yield* listVenue;
      return { confirmation, snapshot };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(layer)),
    );

    expect(Either.isLeft(result.confirmation)).toBe(true);
    if (Either.isLeft(result.confirmation)) {
      expect(result.confirmation.left).toMatchObject({
        _tag: "PaymentDeclined",
        reservationId: "declined-reservation",
      });
    }
    expect(result.snapshot.heldSeats).toEqual(["A1"]);
    expect(result.snapshot.bookedSeats).toEqual([]);
  });
});
