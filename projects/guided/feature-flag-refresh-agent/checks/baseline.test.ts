import { describe, expect, it } from "vitest";
import { Effect } from "effect";

import { FlagStore } from "../src/flag-store.js";
import { refreshOnce } from "../src/refresh-loop.js";
import { makeGatewayHarness } from "./support.js";

describe("baseline: one primary refresh", () => {
  it("records a successful primary snapshot", async () => {
    const gateway = makeGatewayHarness({
      primary: [{ _tag: "Success", version: 1 }],
    });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const observation = yield* refreshOnce;
        const store = yield* FlagStore;
        const state = yield* store.read;
        return { observation, state };
      }).pipe(Effect.provide(gateway.appLayer)),
    );

    expect(result.observation._tag).toBe("Updated");
    expect(result.state.lastGood?.version).toBe(1);
    expect(result.state.lastObservation?._tag).toBe("Updated");
    expect(gateway.snapshot().starts).toEqual(["primary"]);
  });
});
