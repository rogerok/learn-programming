import { describe, expect, it } from "vitest";
import { Effect, Exit } from "effect";

import {
  AttemptTimeout,
  GatewayUnavailable,
} from "../src/errors.js";
import type { AttemptError } from "../src/errors.js";
import { retryPolicy } from "../src/resilience.js";

const runScenario = async (
  outcomes: ReadonlyArray<"ok" | AttemptError>,
): Promise<{ readonly attempts: number; readonly exit: Exit.Exit<string, AttemptError> }> => {
  let attempts = 0;
  const action = Effect.suspend(() => {
    const outcome = outcomes[attempts];
    attempts += 1;
    return outcome === "ok"
      ? Effect.succeed("ok")
      : Effect.fail(
          outcome ??
            new GatewayUnavailable({ source: "primary", status: 503 }),
        );
  });

  const exit = await Effect.runPromiseExit(
    action.pipe(Effect.retry(retryPolicy)),
  );
  return { attempts, exit };
};

describe("milestone 1: selective retry", () => {
  it("retries transient 5xx failures until success", async () => {
    const result = await runScenario([
      new GatewayUnavailable({ source: "primary", status: 503 }),
      new GatewayUnavailable({ source: "primary", status: 503 }),
      "ok",
    ]);

    expect(result.attempts).toBe(3);
    expect(Exit.isSuccess(result.exit)).toBe(true);
  });

  it("does not retry a permanent 4xx failure", async () => {
    const result = await runScenario([
      new GatewayUnavailable({ source: "primary", status: 404 }),
      "ok",
    ]);

    expect(result.attempts).toBe(1);
    expect(Exit.isFailure(result.exit)).toBe(true);
  });

  it("allows four retries after the initial attempt", async () => {
    const unavailable = () =>
      new GatewayUnavailable({ source: "primary", status: 503 });
    const result = await runScenario([
      unavailable(),
      unavailable(),
      unavailable(),
      unavailable(),
      unavailable(),
      "ok",
    ]);

    expect(result.attempts).toBe(5);
    expect(Exit.isFailure(result.exit)).toBe(true);
  });

  it("treats an attempt timeout as transient", async () => {
    const result = await runScenario([
      new AttemptTimeout({ source: "primary" }),
      "ok",
    ]);

    expect(result.attempts).toBe(2);
    expect(Exit.isSuccess(result.exit)).toBe(true);
  });
});
