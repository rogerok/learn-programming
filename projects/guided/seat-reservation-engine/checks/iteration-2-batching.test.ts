import { it as effectIt } from "@effect/vitest";
import { Effect, Ref, TestClock } from "effect";
import { describe, expect, it } from "vitest";

import type { SeatId } from "../src/domain.js";
import {
  makeSeatCatalog,
  type FetchSeatBatch,
  type SeatDetails,
} from "../src/operations/seat-catalog.js";

const detailsFor = (id: SeatId): SeatDetails => ({
  id,
  section: id.startsWith("A") ? "orchestra" : "balcony",
  price: id.startsWith("A") ? 1_500 : 900,
});

const catalogOptions = {
  batchSize: 10,
  capacity: 64,
  timeToLive: "5 minutes",
} as const;

describe("Итерация 2 · Этап 2: Request batching и Cache", () => {
  it("дедуплицирует ключи и режет upstream на bounded batches", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
      const calls = yield* Ref.make<ReadonlyArray<ReadonlyArray<SeatId>>>([]);
      const fetchBatch: FetchSeatBatch = (seatIds) =>
        Ref.update(calls, (current) => [...current, [...seatIds]]).pipe(
          Effect.as(seatIds.map(detailsFor)),
        );
      const catalog = yield* makeSeatCatalog(fetchBatch, catalogOptions);
      const unique = Array.from({ length: 30 }, (_, index) => `S${index + 1}`);
      const requested = Array.from(
        { length: 100 },
        (_, index) => unique[index % unique.length]!,
      );

      const result = yield* Effect.forEach(requested, catalog.get, {
        batching: true,
        concurrency: "unbounded",
      });
      const observedCalls = yield* Ref.get(calls);

      expect(result).toHaveLength(100);
      expect(observedCalls).toHaveLength(3);
      expect(observedCalls.every((batch) => batch.length <= 10)).toBe(true);
      expect(new Set(observedCalls.flat())).toEqual(new Set(unique));
      }),
    );
  });

  effectIt.effect(
    "переиспользует значение до TTL и поддерживает invalidate",
    () =>
    Effect.gen(function* () {
      const calls = yield* Ref.make(0);
      const fetchBatch: FetchSeatBatch = (seatIds) =>
        Ref.update(calls, (count) => count + 1).pipe(
          Effect.as(seatIds.map(detailsFor)),
        );
      const catalog = yield* makeSeatCatalog(fetchBatch, catalogOptions);

      yield* catalog.get("A1");
      yield* catalog.get("A1");
      expect(yield* Ref.get(calls)).toBe(1);

      yield* TestClock.adjust("4 minutes");
      yield* catalog.get("A1");
      expect(yield* Ref.get(calls)).toBe(1);

      yield* TestClock.adjust("2 minutes");
      yield* catalog.get("A1");
      expect(yield* Ref.get(calls)).toBe(2);

      yield* catalog.invalidate("A1");
      yield* catalog.get("A1");
      expect(yield* Ref.get(calls)).toBe(3);
    }),
  );
});
