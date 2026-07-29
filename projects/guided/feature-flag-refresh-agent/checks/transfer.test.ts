import { describe, expect, it } from "vitest";
import { Effect } from "effect";

import {
  AuditWriteError,
  submitAudit,
} from "../src/transfer.js";

describe("transfer: sequential fallback for a side-effecting write", () => {
  it("does not start secondary while primary can still succeed", async () => {
    let secondaryStarts = 0;
    const primary = Effect.succeed({
      idempotencyKey: "audit-1",
      acceptedBy: "primary" as const,
    }).pipe(Effect.delay("20 millis"));
    const secondary = Effect.sync(() => {
      secondaryStarts += 1;
      return {
        idempotencyKey: "audit-1",
        acceptedBy: "secondary" as const,
      };
    });

    const receipt = await Effect.runPromise(
      submitAudit("audit-1", primary, secondary),
    );

    expect(receipt.acceptedBy).toBe("primary");
    expect(secondaryStarts).toBe(0);
  });

  it("retries a transient primary failure before fallback", async () => {
    let primaryAttempts = 0;
    let secondaryStarts = 0;
    const primary = Effect.suspend(() => {
      primaryAttempts += 1;
      return primaryAttempts === 1
        ? Effect.fail(
            new AuditWriteError({ retryable: true, message: "busy" }),
          )
        : Effect.succeed({
            idempotencyKey: "audit-2",
            acceptedBy: "primary" as const,
          });
    });
    const secondary = Effect.sync(() => {
      secondaryStarts += 1;
      return {
        idempotencyKey: "audit-2",
        acceptedBy: "secondary" as const,
      };
    });

    const receipt = await Effect.runPromise(
      submitAudit("audit-2", primary, secondary),
    );

    expect(receipt.acceptedBy).toBe("primary");
    expect(primaryAttempts).toBe(2);
    expect(secondaryStarts).toBe(0);
  });

  it("uses secondary after a permanent primary failure", async () => {
    let secondaryStarts = 0;
    const primary = Effect.fail(
      new AuditWriteError({ retryable: false, message: "rejected" }),
    );
    const secondary = Effect.sync(() => {
      secondaryStarts += 1;
      return {
        idempotencyKey: "audit-3",
        acceptedBy: "secondary" as const,
      };
    });

    const receipt = await Effect.runPromise(
      submitAudit("audit-3", primary, secondary),
    );

    expect(receipt.acceptedBy).toBe("secondary");
    expect(secondaryStarts).toBe(1);
  });
});
