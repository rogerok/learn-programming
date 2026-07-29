import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { scanParcels } from "../src/pipeline.js";
import { makeParcelLookup } from "../src/requests.js";
import { makeGatewayHarness, makeScanOptions, status } from "./support.js";

describe("Этап 2: Request batching и deduplication", () => {
  it("резолвит четыре уникальных ID двумя bounded batches", async () => {
    const harness = makeGatewayHarness([
      status("PKG-A", "in_transit", "Riga"),
      status("PKG-B", "delayed", "Berlin"),
      status("PKG-C", "delivered", "Prague"),
      status("PKG-D", "in_transit", "Berlin"),
    ]);
    const input = ["PKG-A", "PKG-B", "PKG-A", "PKG-C", "PKG-D"];

    const rows = await Effect.runPromise(
      scanParcels(
        input,
        harness.gateway,
        makeScanOptions({ concurrency: 16, batchSize: 3 }),
      ),
    );

    expect(rows.map((row) => row.trackingId)).toEqual(input);
    expect(rows.every((row) => row._tag === "Found")).toBe(true);
    expect(harness.calls).toHaveLength(2);
    expect(harness.calls.every((batch) => batch.length <= 3)).toBe(true);
    expect(harness.calls.flat().sort()).toEqual([
      "PKG-A",
      "PKG-B",
      "PKG-C",
      "PKG-D",
    ]);
  });

  it("завершает отсутствующую заявку, не подвешивая соседние", async () => {
    const harness = makeGatewayHarness([
      status("PKG-A", "in_transit", "Riga"),
      status("PKG-C", "delivered", "Prague"),
    ]);

    const rows = await Effect.runPromise(
      scanParcels(
        ["PKG-A", "PKG-MISSING", "PKG-C"],
        harness.gateway,
        makeScanOptions({ concurrency: 16, batchSize: 3 }),
      ).pipe(
        Effect.timeoutFail({
          duration: "500 millis",
          onTimeout: () => new Error("resolver не завершил каждую заявку"),
        }),
      ),
    );

    expect(rows.map((row) => row._tag)).toEqual([
      "Found",
      "Failed",
      "Found",
    ]);
    expect(rows[1]?._tag).toBe("Failed");
    if (rows[1]?._tag === "Failed") {
      expect(rows[1].error._tag).toBe("ParcelNotFound");
    }
    expect(harness.calls).toHaveLength(1);
  });

  it("ограничивает resolver batch независимо от Stream grouping", async () => {
    const harness = makeGatewayHarness([
      status("PKG-E", "in_transit", "Riga"),
      status("PKG-F", "delayed", "Berlin"),
      status("PKG-G", "delivered", "Prague"),
      status("PKG-H", "in_transit", "Berlin"),
    ]);
    const options = makeScanOptions({ batchSize: 2 });
    const lookup = makeParcelLookup(harness.gateway, {
      batchSize: options.batchSize,
      resilience: options.resilience,
    });

    const statuses = await Effect.runPromise(
      Effect.forEach(
        ["PKG-E", "PKG-F", "PKG-G", "PKG-H", "PKG-E"],
        lookup.lookup,
        {
          concurrency: "unbounded",
          batching: true,
        },
      ).pipe(Effect.withRequestCaching(true)),
    );

    expect(statuses.map(({ trackingId }) => trackingId)).toEqual([
      "PKG-E",
      "PKG-F",
      "PKG-G",
      "PKG-H",
      "PKG-E",
    ]);
    expect(harness.calls).toHaveLength(2);
    expect(harness.calls.every((batch) => batch.length <= 2)).toBe(true);
    expect(harness.calls.flat().sort()).toEqual([
      "PKG-E",
      "PKG-F",
      "PKG-G",
      "PKG-H",
    ]);
  });
});
