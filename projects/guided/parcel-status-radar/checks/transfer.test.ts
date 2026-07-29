import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { summarizeByHub } from "../src/summary.js";
import { makeGatewayHarness, makeScanOptions, status } from "./support.js";

describe("Независимый transfer: агрегат по destination hub", () => {
  it("считает повторные посылки, переиспользуя bounded request batches", async () => {
    const harness = makeGatewayHarness([
      status("PKG-A", "in_transit", "North"),
      status("PKG-B", "delayed", "South"),
      status("PKG-C", "delivered", "North"),
      status("PKG-D", "in_transit", "South"),
    ]);

    const summary = await Effect.runPromise(
      summarizeByHub(
        ["PKG-A", "PKG-B", "PKG-A", "PKG-C", "PKG-D"],
        harness.gateway,
        makeScanOptions({ concurrency: 16, batchSize: 2 }),
      ),
    );

    expect(summary).toEqual([
      { hub: "North", parcels: 3 },
      { hub: "South", parcels: 2 },
    ]);
    expect(harness.calls).toHaveLength(2);
    expect(harness.calls.every((batch) => batch.length <= 2)).toBe(true);
    expect(harness.calls.flat().sort()).toEqual([
      "PKG-A",
      "PKG-B",
      "PKG-C",
      "PKG-D",
    ]);
  });
});
