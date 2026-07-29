import { describe, expect, it } from "vitest";
import { Effect, Stream } from "effect";

import { makeCatalogLoader } from "../src/catalog-loader.js";
import { enrichOrderLines } from "../src/pipeline.js";
import {
  makeCatalogGatewayHarness,
  makeOrderLines,
  makeProducts,
} from "./support.js";

describe("milestone 3: RequestResolver batching", () => {
  it("replaces nine single lookups with bounded bulk calls", async () => {
    const lines = makeOrderLines();
    const gateway = makeCatalogGatewayHarness(makeProducts(lines));
    const loader = await Effect.runPromise(
      makeCatalogLoader.pipe(Effect.provide(gateway.layer)),
    );

    const enriched = await Effect.runPromise(
      enrichOrderLines(Stream.fromIterable(lines), loader).pipe(
        Stream.runCollect,
      ),
    );

    expect(gateway.snapshot().singleCalls).toEqual([]);
    const bulkCalls = gateway.snapshot().bulkCalls;
    expect(bulkCalls.length).toBeLessThan(9);
    expect(bulkCalls.every((batch) => batch.length <= 4)).toBe(true);
    expect(bulkCalls.flat()).toEqual(lines.map(({ productId }) => productId));
    expect(enriched.map(({ product }) => product.id)).toEqual(
      lines.map(({ productId }) => productId),
    );
  });

  it("splits unbounded request demand into batches of at most four", async () => {
    const lines = makeOrderLines();
    const gateway = makeCatalogGatewayHarness(makeProducts(lines));
    const loader = await Effect.runPromise(
      makeCatalogLoader.pipe(Effect.provide(gateway.layer)),
    );

    await Effect.runPromise(
      Effect.forEach(lines, (line) => loader.get(line.productId), {
        concurrency: "unbounded",
        discard: true,
      }),
    );

    expect(gateway.snapshot().bulkCalls).toEqual([
      ["product-1", "product-2", "product-3", "product-4"],
      ["product-5", "product-6", "product-7", "product-8"],
      ["product-9"],
    ]);
  });

  it("completes an unknown product request with ProductNotFound", async () => {
    const gateway = makeCatalogGatewayHarness(new Map());
    const loader = await Effect.runPromise(
      makeCatalogLoader.pipe(Effect.provide(gateway.layer)),
    );

    const error = await Effect.runPromise(
      loader.get("missing-product").pipe(
        Effect.match({
          onFailure: (failure) => failure,
          onSuccess: () => undefined,
        }),
      ),
    );

    expect(error?._tag).toBe("ProductNotFound");
    if (error?._tag === "ProductNotFound") {
      expect(error.productId).toBe("missing-product");
    }
  });
});
