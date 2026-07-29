import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { scanParcels } from "../src/pipeline.js";
import { makeGatewayHarness, makeScanOptions, status } from "./support.js";

describe("starter: корректный последовательный отчёт", () => {
  it("сохраняет каждый вход и изолирует ParcelNotFound", async () => {
    const harness = makeGatewayHarness([
      status("PKG-A", "in_transit", "Riga"),
    ]);

    const rows = await Effect.runPromise(
      scanParcels(
        ["PKG-A", "PKG-MISSING", "PKG-A"],
        harness.gateway,
        makeScanOptions(),
      ),
    );

    expect(rows.map((row) => row.trackingId)).toEqual([
      "PKG-A",
      "PKG-MISSING",
      "PKG-A",
    ]);
    expect(rows.map((row) => row._tag)).toEqual([
      "Found",
      "Failed",
      "Found",
    ]);
    expect(rows[1]?._tag).toBe("Failed");
    if (rows[1]?._tag === "Failed") {
      expect(rows[1].error._tag).toBe("ParcelNotFound");
    }
  });
});
