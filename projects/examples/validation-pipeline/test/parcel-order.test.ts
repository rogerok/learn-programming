import { describe, expect, it } from "vitest";

import { validateParcelOrder } from "../src/parcel-order.js";

describe("validateParcelOrder", () => {
  it("нормализует валидный courier-заказ", () => {
    const result = validateParcelOrder({
      orderId: "  ord-2026-0042 ",
      recipient: {
        name: "  Анна   Смирнова ",
        email: " ANNA@EXAMPLE.COM ",
      },
      declaredValue: "1250.50",
      delivery: {
        kind: "courier",
        address: "  Невский   проспект, 28 ",
        timeWindow: "evening",
      },
    });

    expect(result).toEqual({
      kind: "valid",
      value: {
        orderId: "ORD-2026-0042",
        recipient: {
          name: "Анна Смирнова",
          email: "anna@example.com",
        },
        declaredValueCents: 125_050,
        delivery: {
          kind: "courier",
          address: "Невский проспект, 28",
          timeWindow: "evening",
        },
      },
    });
  });

  it("выбирает locker-ветку discriminated union", () => {
    const result = validateParcelOrder({
      orderId: "ORD-2026-0007",
      recipient: { name: "Лев", email: "lev@example.org" },
      declaredValue: 42,
      delivery: { kind: "locker", lockerId: " lck-a1b2 " },
    });

    expect(result).toMatchObject({
      kind: "valid",
      value: {
        declaredValueCents: 4_200,
        delivery: { kind: "locker", lockerId: "LCK-A1B2" },
      },
    });
  });

  it("накапливает независимые ошибки, а не останавливается на первой", () => {
    const result = validateParcelOrder({
      orderId: "wrong",
      recipient: { name: "   ", email: "not-an-email" },
      declaredValue: 0,
      delivery: {
        kind: "courier",
        address: "коротко",
        timeWindow: "night",
      },
    });

    expect(result.kind).toBe("invalid");
    if (result.kind === "invalid") {
      expect(result.errors.map(({ path, code }) => ({ path, code }))).toEqual([
        { path: "$input.orderId", code: "format" },
        { path: "$input.recipient.name", code: "required" },
        { path: "$input.recipient.email", code: "format" },
        { path: "$input.declaredValue", code: "range" },
        { path: "$input.delivery.address", code: "range" },
        { path: "$input.delivery.timeWindow", code: "unsupported" },
      ]);
    }
  });

  it("сообщает об неизвестном discriminator в точном пути", () => {
    const result = validateParcelOrder({
      orderId: "ORD-2026-0042",
      recipient: { name: "Анна", email: "anna@example.com" },
      declaredValue: "10.00",
      delivery: { kind: "drone", landingPad: "roof" },
    });

    expect(result).toEqual({
      kind: "invalid",
      errors: [
        {
          path: "$input.delivery.kind",
          code: "unsupported",
          message: "Допустимы варианты courier или locker",
        },
      ],
    });
  });
});
