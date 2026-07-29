import { describe, expect, it } from "vitest";
import { Effect, Layer } from "effect";

import { runDispatcher } from "../src/pipeline.js";
import { makeNotificationSourceLayer } from "../src/services.js";
import { makeGatewayHarness, makeNotifications } from "./support.js";

describe("starter", () => {
  it("delivers every source notification exactly once", async () => {
    const notifications = makeNotifications(7);
    const gateway = makeGatewayHarness();
    const layer = Layer.mergeAll(
      makeNotificationSourceLayer(notifications),
      gateway.layer,
    );

    const outcomes = await Effect.runPromise(
      runDispatcher.pipe(Effect.provide(layer)),
    );
    const deliveredIds = outcomes.flatMap((outcome) =>
      outcome._tag === "Delivered" ? outcome.notificationIds : [],
    );

    expect(deliveredIds).toEqual(notifications.map(({ id }) => id));
    expect(gateway.snapshot().active).toBe(0);
  });
});
