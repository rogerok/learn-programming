import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";

import { decodeBookingCommand } from "../src/domain.js";

const decode = (input: unknown) =>
  Effect.runPromise(decodeBookingCommand(input).pipe(Effect.either));

describe("Этап 1: Schema на границе доверия", () => {
  it("декодирует корректную hold-команду во внутреннюю модель", async () => {
    const result = await decode({
      type: "hold",
      seats: ["A1", "A2"],
      durationMs: 30_000,
    });

    expect(Either.isRight(result)).toBe(true);
    if (Either.isRight(result)) {
      expect(result.right).toEqual({
        type: "hold",
        seats: ["A1", "A2"],
        durationMs: 30_000,
      });
    }
  });

  it.each([
    ["пустой список мест", { type: "hold", seats: [], durationMs: 1_000 }],
    [
      "повторяющиеся места",
      { type: "hold", seats: ["A1", "A1"], durationMs: 1_000 },
    ],
    [
      "неположительный срок",
      { type: "hold", seats: ["A1"], durationMs: 0 },
    ],
    [
      "строковый срок",
      { type: "hold", seats: ["A1"], durationMs: "1000" },
    ],
  ])("отклоняет %s", async (_case, input) => {
    const result = await decode(input);
    expect(Either.isLeft(result)).toBe(true);
  });

  it("проверяет поля confirm-команды до входа в domain", async () => {
    const result = await decode({
      type: "confirm",
      reservationId: "",
      amount: -10,
    });

    expect(Either.isLeft(result)).toBe(true);
  });
});
