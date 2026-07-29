import { describe, expect, it } from "vitest";
import { Effect, Stream } from "effect";

import { dispatchFixedBatches } from "../src/pipeline.js";
import { makeGatewayHarness, makeNotifications } from "./support.js";

describe("milestone 1: fixed batches", () => {
  it("sends seven notifications as batches of 3, 3 and 1", async () => {
    const notifications = makeNotifications(7);
    const gateway = makeGatewayHarness();

    const outcomes = await Effect.runPromise(
      dispatchFixedBatches(Stream.fromIterable(notifications)).pipe(
        Stream.runCollect,
        Effect.provide(gateway.layer),
      ),
    );

    expect(gateway.snapshot().calls).toEqual([
      ["n1", "n2", "n3"],
      ["n4", "n5", "n6"],
      ["n7"],
    ]);
    expect(outcomes.flatMap(({ notificationIds }) => notificationIds)).toEqual(
      notifications.map(({ id }) => id),
    );
  });
});
