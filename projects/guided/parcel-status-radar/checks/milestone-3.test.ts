import { it } from "@effect/vitest";
import {
  Effect,
  Either,
  Exit,
  Fiber,
  Option,
  Ref,
  TestClock,
} from "effect";
import { describe, expect } from "vitest";

import { CarrierUnavailable } from "../src/domain.js";
import {
  fetchBatchWithPolicy,
  type FetchParcelBatch,
  type ResilienceOptions,
} from "../src/resilience.js";
import { status } from "./support.js";

const baseOptions: ResilienceOptions = {
  timeoutMs: 100,
  maxRetries: 3,
  initialDelayMs: 20,
  maxDelayMs: 100,
};

describe("Этап 3: timeout каждой attempt и selective Schedule", () => {
  it.effect("повторяет CarrierUnavailable и возвращает третий успех", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0);
      const fetchBatch: FetchParcelBatch = (trackingIds) =>
        Ref.updateAndGet(attempts, (count) => count + 1).pipe(
          Effect.flatMap((attempt) =>
            attempt < 3
              ? Effect.fail(
                  new CarrierUnavailable({ message: `attempt ${attempt}` }),
                )
              : Effect.succeed([
                  status(trackingIds[0] ?? "PKG-A", "in_transit", "Riga"),
                ]),
          ),
        );

      const fiber = yield* fetchBatchWithPolicy(
        fetchBatch,
        ["PKG-A"],
        baseOptions,
      ).pipe(Effect.either, Effect.fork);
      yield* TestClock.adjust("200 millis");
      const result = yield* Fiber.join(fiber);

      expect(Either.isRight(result)).toBe(true);
      expect(yield* Ref.get(attempts)).toBe(3);
    }),
  );

  it.effect("ограничивает каждую exponential delay значением maxDelayMs", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0);
      const fetchBatch: FetchParcelBatch = () =>
        Ref.updateAndGet(attempts, (count) => count + 1).pipe(
          Effect.flatMap((attempt) =>
            attempt < 4
              ? Effect.fail(
                  new CarrierUnavailable({ message: `attempt ${attempt}` }),
                )
              : Effect.succeed([
                  status("PKG-A", "in_transit", "Riga"),
                ]),
          ),
        );
      const options: ResilienceOptions = {
        ...baseOptions,
        initialDelayMs: 40,
        maxDelayMs: 50,
      };

      const fiber = yield* fetchBatchWithPolicy(
        fetchBatch,
        ["PKG-A"],
        options,
      ).pipe(Effect.either, Effect.fork);

      yield* TestClock.adjust("40 millis");
      expect(yield* Ref.get(attempts)).toBe(2);
      yield* TestClock.adjust("50 millis");
      expect(yield* Ref.get(attempts)).toBe(3);
      yield* TestClock.adjust("50 millis");

      const result = yield* Fiber.join(fiber);
      expect(Either.isRight(result)).toBe(true);
      expect(yield* Ref.get(attempts)).toBe(4);
    }),
  );

  it.effect("не считает retry delay частью timeout следующей attempt", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0);
      const fetchBatch: FetchParcelBatch = () =>
        Ref.updateAndGet(attempts, (count) => count + 1).pipe(
          Effect.flatMap((attempt) =>
            attempt === 1
              ? Effect.fail(new CarrierUnavailable({ message: "temporary" }))
              : Effect.sleep("80 millis").pipe(
                  Effect.as([status("PKG-A", "delivered", "Prague")]),
                ),
          ),
        );
      const options: ResilienceOptions = {
        ...baseOptions,
        maxRetries: 1,
        initialDelayMs: 40,
        maxDelayMs: 40,
      };

      const fiber = yield* fetchBatchWithPolicy(
        fetchBatch,
        ["PKG-A"],
        options,
      ).pipe(Effect.either, Effect.fork);
      yield* TestClock.adjust("120 millis");
      const result = yield* Fiber.join(fiber);

      expect(Either.isRight(result)).toBe(true);
      expect(yield* Ref.get(attempts)).toBe(2);
    }),
  );

  it.effect("прерывает зависшую attempt typed CarrierTimeout", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0);
      const fetchBatch: FetchParcelBatch = () =>
        Ref.update(attempts, (count) => count + 1).pipe(
          Effect.zipRight(Effect.never),
        );

      const fiber = yield* fetchBatchWithPolicy(
        fetchBatch,
        ["PKG-A"],
        baseOptions,
      ).pipe(Effect.either, Effect.fork);
      yield* TestClock.adjust("100 millis");
      const polled = yield* Fiber.poll(fiber);
      yield* Fiber.interrupt(fiber);

      expect(Option.isSome(polled)).toBe(true);
      if (Option.isSome(polled)) {
        expect(Exit.isSuccess(polled.value)).toBe(true);
        if (Exit.isSuccess(polled.value)) {
          expect(Either.isLeft(polled.value.value)).toBe(true);
          if (Either.isLeft(polled.value.value)) {
            expect(polled.value.value.left._tag).toBe("CarrierTimeout");
          }
        }
      }
      expect(yield* Ref.get(attempts)).toBe(1);
    }),
  );
});
