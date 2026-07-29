import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { scanParcels } from "../src/pipeline.js";
import { makeGatewayHarness, makeScanOptions, status } from "./support.js";

describe("Этап 1: Stream и bounded concurrency", () => {
  it("выполняет два lookup одновременно и сохраняет входной порядок", async () => {
    const harness = makeGatewayHarness(
      [
        status("PKG-SLOW", "delayed", "Berlin"),
        status("PKG-FAST-1", "in_transit", "Riga"),
        status("PKG-FAST-2", "delivered", "Prague"),
        status("PKG-FAST-3", "in_transit", "Riga"),
      ],
      {
        delayByTrackingId: {
          "PKG-SLOW": 30,
          "PKG-FAST-1": 5,
          "PKG-FAST-2": 5,
          "PKG-FAST-3": 5,
        },
      },
    );
    const input = ["PKG-SLOW", "PKG-FAST-1", "PKG-FAST-2", "PKG-FAST-3"];

    const rows = await Effect.runPromise(
      scanParcels(
        input,
        harness.gateway,
        makeScanOptions({ concurrency: 2, batchSize: 1 }),
      ),
    );

    expect(harness.maximumActive).toBe(2);
    expect(rows.map((row) => row.trackingId)).toEqual(input);
    expect(rows.every((row) => row._tag === "Found")).toBe(true);
  });
});
