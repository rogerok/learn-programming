import { expect, it } from "@effect/vitest";
import { Effect, Fiber } from "effect";
import * as TestClock from "effect/TestClock";

import { FlagStore } from "../src/flag-store.js";
import { refreshLoop } from "../src/refresh-loop.js";
import { makeGatewayHarness } from "./support.js";

it.effect("milestone 3: keeps polling after an unavailable round", () => {
  const gateway = makeGatewayHarness({
    primary: [
      { _tag: "Success", version: 1 },
      { _tag: "Rejected", reason: "primary schema" },
      { _tag: "Success", version: 2 },
    ],
    replica: [{ _tag: "Rejected", reason: "replica schema" }],
  });

  return Effect.gen(function* () {
    const fiber = yield* Effect.fork(refreshLoop);

    yield* TestClock.adjust("0 millis");
    yield* Effect.yieldNow();
    expect(gateway.snapshot().starts).toEqual(["primary"]);

    yield* TestClock.adjust("1 second");
    yield* Effect.yieldNow();

    yield* TestClock.adjust("20 millis");
    yield* Effect.yieldNow();
    expect(gateway.snapshot().starts).toContain("replica");
    yield* TestClock.adjust("980 millis");
    yield* Effect.yieldNow();

    const store = yield* FlagStore;
    const state = yield* store.read;
    yield* Fiber.interrupt(fiber);

    expect(
      gateway.snapshot().starts.filter((source) => source === "primary"),
    ).toHaveLength(3);
    expect(state.lastGood?.version).toBe(2);
    expect(state.lastObservation?._tag).toBe("Updated");
  }).pipe(Effect.provide(gateway.appLayer));
});
