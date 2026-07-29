import { describe, expect, it } from "vitest";
import { Effect, Stream } from "effect";

import { dispatchFixedBatches } from "../src/pipeline.js";
import { makeGatewayHarness, makeNotifications } from "./support.js";

describe("milestone 3: retry and failure isolation", () => {
  it("retries transient failures but not rejected batches", async () => {
    const notifications = makeNotifications(7);
    const gateway = makeGatewayHarness({
      scripts: {
        "n1+n2+n3": ["unavailable", "unavailable", "success"],
        "n4+n5+n6": ["rejected"],
        n7: ["success"],
      },
    });

    const outcomes = await Effect.runPromise(
      dispatchFixedBatches(Stream.fromIterable(notifications)).pipe(
        Stream.runCollect,
        Effect.provide(gateway.layer),
      ),
    );
    const snapshot = gateway.snapshot();

    expect(snapshot.attemptsByBatch["n1+n2+n3"]).toBe(3);
    expect(snapshot.attemptsByBatch["n4+n5+n6"]).toBe(1);
    expect(snapshot.attemptsByBatch.n7).toBe(1);
    expect(outcomes.map(({ _tag }) => _tag)).toEqual([
      "Delivered",
      "Failed",
      "Delivered",
    ]);
    expect(outcomes[1]).toMatchObject({
      _tag: "Failed",
      reason: "BatchRejected",
      notificationIds: ["n4", "n5", "n6"],
    });
  });
});
