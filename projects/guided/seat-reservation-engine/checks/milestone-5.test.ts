import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { makeBookingProcessor } from "../src/booking.js";
import type { BookingEvent } from "../src/domain.js";
import { makeTestLayer } from "./support.js";

describe("Этап 5: Queue, Deferred, PubSub и Semaphore", () => {
  it("ограничивает оплату и доставляет одинаковые события подписчикам", async () => {
    let activePayments = 0;
    let maxActivePayments = 0;
    const firstSubscriber: BookingEvent[] = [];
    const secondSubscriber: BookingEvent[] = [];

    const layer = makeTestLayer({
      seats: ["A1", "A2", "A3", "A4"],
      ids: ["r-1", "r-2", "r-3", "r-4"],
      charge: () =>
        Effect.acquireUseRelease(
          Effect.sync(() => {
            activePayments += 1;
            maxActivePayments = Math.max(
              maxActivePayments,
              activePayments,
            );
          }),
          () => Effect.sleep("25 millis"),
          () =>
            Effect.sync(() => {
              activePayments -= 1;
            }),
        ),
    });

    const requests = ["A1", "A2", "A3", "A4"].map((seat) => ({
      seats: [seat],
      amount: 1_000,
      durationMs: 10_000,
    }));

    const program = Effect.scoped(
      Effect.gen(function* () {
        const processor = yield* makeBookingProcessor({
          workerCount: 3,
          queueCapacity: 1,
          paymentConcurrency: 2,
        });
        yield* processor.subscribe((event) =>
          Effect.sync(() => {
            firstSubscriber.push(event);
          }),
        );
        yield* processor.subscribe((event) =>
          Effect.sync(() => {
            secondSubscriber.push(event);
          }),
        );

        const outcomes = yield* Effect.all(
          requests.map((request) => processor.submit(request)),
          { concurrency: "unbounded" },
        );
        const eventLog = yield* processor.eventLog;
        return { outcomes, eventLog };
      }),
    );

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

    expect(result.outcomes.map((outcome) => outcome._tag)).toEqual([
      "Booked",
      "Booked",
      "Booked",
      "Booked",
    ]);
    expect(maxActivePayments).toBe(2);
    expect(firstSubscriber.map((event) => event._tag)).toEqual(
      result.eventLog.map((event) => event._tag),
    );
    expect(secondSubscriber.map((event) => event._tag)).toEqual(
      result.eventLog.map((event) => event._tag),
    );
    expect(result.eventLog).toHaveLength(8);
  });
});
