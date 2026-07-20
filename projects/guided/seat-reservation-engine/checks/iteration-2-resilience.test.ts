import { it } from "@effect/vitest";
import {
  Cause,
  Effect,
  Either,
  Exit,
  Fiber,
  Option,
  Ref,
  TestClock,
} from "effect";
import { describe, expect } from "vitest";

import { PaymentDeclined } from "../src/errors.js";
import {
  chargeWithResilience,
  PaymentGatewayUnavailable,
  type PaymentResilienceOptions,
  type ResilientPaymentGateway,
} from "../src/operations/resilience.js";

const options: PaymentResilienceOptions = {
  timeoutMs: 5_000,
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 1_000,
};

describe("Итерация 2 · Этап 3: Schedule, timeout и tagged retry", () => {
  it.effect("повторяет transient failure и завершает успешную попытку", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0);
      const gateway: ResilientPaymentGateway = {
        charge: () =>
          Ref.updateAndGet(attempts, (count) => count + 1).pipe(
            Effect.flatMap((attempt) =>
              attempt < 3
                ? Effect.fail(
                    new PaymentGatewayUnavailable({ message: "gateway down" }),
                  )
                : Effect.void,
            ),
          ),
      };

      const fiber = yield* Effect.fork(
        chargeWithResilience(gateway, "r-1", 1_500, options).pipe(
          Effect.either,
        ),
      );
      yield* TestClock.adjust("1 second");
      const result = yield* Fiber.join(fiber);

      expect(Either.isRight(result)).toBe(true);
      expect(yield* Ref.get(attempts)).toBe(3);
    }),
  );

  it.effect("не повторяет постоянный PaymentDeclined", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0);
      const gateway: ResilientPaymentGateway = {
        charge: (reservationId) =>
          Ref.update(attempts, (count) => count + 1).pipe(
            Effect.zipRight(
              Effect.fail(
                new PaymentDeclined({
                  reservationId,
                  reason: "insufficient funds",
                }),
              ),
            ),
          ),
      };

      const result = yield* chargeWithResilience(
        gateway,
        "r-declined",
        1_500,
        options,
      ).pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("PaymentDeclined");
      }
      expect(yield* Ref.get(attempts)).toBe(1);
    }),
  );

  it.effect("прерывает зависшую попытку typed timeout-ом", () =>
    Effect.gen(function* () {
      const gateway: ResilientPaymentGateway = {
        charge: () => Effect.never,
      };
      const fiber = yield* Effect.fork(
        chargeWithResilience(gateway, "r-timeout", 1_500, options).pipe(
          Effect.either,
        ),
      );

      yield* TestClock.adjust("5 seconds");
      const polled = yield* Fiber.poll(fiber);
      yield* Fiber.interrupt(fiber);

      expect(Option.isSome(polled)).toBe(true);
      if (Option.isSome(polled)) {
        expect(Exit.isSuccess(polled.value)).toBe(true);
        if (Exit.isSuccess(polled.value)) {
          expect(Either.isLeft(polled.value.value)).toBe(true);
          if (Either.isLeft(polled.value.value)) {
            expect(polled.value.value.left._tag).toBe("PaymentTimeout");
          }
        } else {
          expect(Option.isSome(Cause.failureOption(polled.value.cause))).toBe(
            true,
          );
        }
      }
    }),
  );
});
