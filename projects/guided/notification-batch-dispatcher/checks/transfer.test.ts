import { expect, it } from "@effect/vitest";
import { Effect, Fiber, Stream } from "effect";
import { TestClock } from "effect/testing";

import { dispatchWithin } from "../src/transfer.js";
import { makeGatewayHarness, makeNotifications } from "./support.js";

it.effect("flushes a sparse batch when the time boundary is reached", () =>
  Effect.gen(function* () {
    const notification = makeNotifications(1)[0];
    if (notification === undefined) {
      return yield* Effect.die("fixture must contain one notification");
    }

    const gateway = makeGatewayHarness();
    const sparseSource = Stream.make(notification).pipe(
      Stream.concat(Stream.never),
    );
    const fiber = yield* dispatchWithin(sparseSource).pipe(
      Stream.take(1),
      Stream.runCollect,
      Effect.provide(gateway.layer),
      Effect.forkChild,
    );

    yield* Effect.yieldNow;
    yield* TestClock.adjust("49 millis");
    expect(fiber.pollUnsafe()).toBeUndefined();

    yield* TestClock.adjust("1 millis");
    yield* Effect.yieldNow;
    expect(fiber.pollUnsafe()).toBeDefined();

    const outcomes = yield* Fiber.join(fiber);
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0]).toMatchObject({
      _tag: "Delivered",
      notificationIds: ["n1"],
    });
    expect(gateway.snapshot().calls).toEqual([["n1"]]);
  }),
);
