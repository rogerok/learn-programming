import { Effect, Ref, Stream } from "effect";
import { describe, expect, it } from "vitest";

import type { SeatId } from "../src/domain.js";
import { reconcileBookingLog } from "../src/operations/reconcile.js";
import {
  makeSeatCatalog,
  type FetchSeatBatch,
} from "../src/operations/seat-catalog.js";

const lines = Array.from({ length: 20 }, (_, index) =>
  JSON.stringify({
    reservationId: `r-${index + 1}`,
    seats: [`S${(index % 12) + 1}`],
  }),
);

describe("Итерация 2 · Transfer: offline reconciliation", () => {
  it(
    "переносит batching из live workflow в конечный JSONL stream",
    async () => {
      await Effect.runPromise(
        Effect.gen(function* () {
      const calls = yield* Ref.make<ReadonlyArray<ReadonlyArray<SeatId>>>([]);
      const fetchBatch: FetchSeatBatch = (seatIds) =>
        Ref.update(calls, (current) => [...current, [...seatIds]]).pipe(
          Effect.as(
            seatIds.map((id) => ({
              id,
              section: "reconciliation",
              price: 100,
            })),
          ),
        );
      const catalog = yield* makeSeatCatalog(fetchBatch, {
        batchSize: 5,
        capacity: 32,
        timeToLive: "1 hour",
      });

      const report = yield* reconcileBookingLog(
        Stream.fromIterable(lines),
        catalog,
      );
      const observedCalls = yield* Ref.get(calls);

      expect(report).toEqual({
        processedReservations: 20,
        seatLookups: 20,
        totalPrice: 2_000,
      });
      expect(observedCalls).toHaveLength(3);
      expect(observedCalls.every((batch) => batch.length <= 5)).toBe(true);
      expect(new Set(observedCalls.flat()).size).toBe(12);
        }),
      );
    },
  );
});
