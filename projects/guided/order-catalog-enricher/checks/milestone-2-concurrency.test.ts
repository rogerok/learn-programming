import { describe, expect, it } from "vitest";
import { Effect, Fiber, Stream } from "effect";

import { enrichOrderLines } from "../src/pipeline.js";
import {
  makeBlockingLoaderHarness,
  makeOrderLines,
  makeProducts,
} from "./support.js";

describe("milestone 2: bounded concurrency", () => {
  it("starts four lookups, blocks the fifth, and preserves output order", async () => {
    const lines = makeOrderLines();

    const observation = await Effect.runPromise(
      Effect.gen(function* () {
        const loader = yield* makeBlockingLoaderHarness(makeProducts(lines));
        const fiber = yield* enrichOrderLines(
          Stream.fromIterable(lines),
          loader.service,
        ).pipe(Stream.runCollect, Effect.forkChild);

        for (let index = 0; index < 5; index += 1) {
          yield* Effect.yieldNow;
        }

        const beforeRelease = loader.snapshot();
        yield* loader.release;
        const enriched = yield* Fiber.join(fiber);

        return {
          beforeRelease,
          afterCompletion: loader.snapshot(),
          enriched,
        };
      }),
    );

    expect(observation.beforeRelease.started).toEqual([
      "product-1",
      "product-2",
      "product-3",
      "product-4",
    ]);
    expect(observation.beforeRelease.active).toBe(4);
    expect(observation.beforeRelease.maxActive).toBe(4);
    expect(observation.afterCompletion.active).toBe(0);
    expect(observation.enriched.map(({ id }) => id)).toEqual(
      lines.map(({ id }) => id),
    );
  });
});
