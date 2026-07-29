import { describe, expect, it } from "vitest";
import { Effect, Stream } from "effect";

import { dispatchFixedBatches } from "../src/pipeline.js";
import { makeGatewayHarness, makeNotifications } from "./support.js";

describe("milestone 2: bounded concurrency", () => {
  it("overlaps two batches without exceeding the limit", async () => {
    const notifications = makeNotifications(7);
    const gateway = makeGatewayHarness({ delayMillis: 35 });

    const outcomes = await Effect.runPromise(
      dispatchFixedBatches(Stream.fromIterable(notifications)).pipe(
        Stream.runCollect,
        Effect.provide(gateway.layer),
      ),
    );

    expect(gateway.snapshot().maxActive).toBe(2);
    expect(outcomes.map(({ notificationIds }) => notificationIds)).toEqual([
      ["n1", "n2", "n3"],
      ["n4", "n5", "n6"],
      ["n7"],
    ]);
  });
});
