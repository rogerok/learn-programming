import { describe, expect, it } from "vitest";
import { Effect } from "effect";

import { fetchFlags } from "../src/fetch-flags.js";
import { makeGatewayHarness } from "./support.js";

const runFetch = <A, E>(effect: Effect.Effect<A, E>) =>
  Effect.runPromise(effect.pipe(Effect.timeout("500 millis")));

describe("milestone 2: hedge and time budgets", () => {
  it("does not start replica when primary succeeds before the hedge delay", async () => {
    const gateway = makeGatewayHarness({
      primary: [{ _tag: "Success", version: 1, delay: "5 millis" }],
      replica: [{ _tag: "Success", version: 2 }],
    });

    const snapshot = await runFetch(
      fetchFlags.pipe(Effect.provide(gateway.layer)),
    );

    expect(snapshot.source).toBe("primary");
    expect(gateway.snapshot().starts).toEqual(["primary"]);
  });

  it("waits for replica success after an early permanent primary failure", async () => {
    const gateway = makeGatewayHarness({
      primary: [
        { _tag: "Rejected", reason: "bad schema", delay: "5 millis" },
      ],
      replica: [{ _tag: "Success", version: 2, delay: "5 millis" }],
    });

    const snapshot = await runFetch(
      fetchFlags.pipe(Effect.provide(gateway.layer)),
    );

    expect(snapshot.source).toBe("replica");
    expect(gateway.snapshot().starts).toEqual(["primary", "replica"]);
  });

  it("interrupts a hanging primary after replica wins", async () => {
    const gateway = makeGatewayHarness({
      primary: [{ _tag: "Hang" }],
      replica: [{ _tag: "Success", version: 3, delay: "5 millis" }],
    });

    const snapshot = await runFetch(
      fetchFlags.pipe(Effect.provide(gateway.layer)),
    );

    expect(snapshot.source).toBe("replica");
    expect(gateway.snapshot().interrupts).toContain("primary");
  });

  it("fails with the total deadline when both sources hang", async () => {
    const gateway = makeGatewayHarness({
      primary: Array.from({ length: 8 }, () => ({ _tag: "Hang" as const })),
      replica: Array.from({ length: 8 }, () => ({ _tag: "Hang" as const })),
    });

    const error = await Effect.runPromise(
      fetchFlags.pipe(
        Effect.provide(gateway.layer),
        Effect.timeout("500 millis"),
        Effect.flip,
      ),
    );

    expect(error._tag).toBe("DeadlineExceeded");
    expect(gateway.snapshot().interrupts.length).toBeGreaterThan(0);
  });
});
