import { describe, expect, it } from "vitest";
import { Effect, Layer } from "effect";

import { CatalogLoaderLive } from "../src/catalog-loader.js";
import { runOrderExport } from "../src/pipeline.js";
import {
  makeCatalogGatewayHarness,
  makeOrderFeedHarness,
  makeOrderLines,
  makeProducts,
} from "./support.js";

describe("starter", () => {
  it("enriches every order line exactly once and preserves source order", async () => {
    const lines = makeOrderLines();
    const feed = makeOrderFeedHarness(lines);
    const gateway = makeCatalogGatewayHarness(makeProducts(lines));
    const loaderLayer = CatalogLoaderLive.pipe(
      Layer.provide(gateway.layer),
    );
    const mainLayer = Layer.merge(feed.layer, loaderLayer);

    const enriched = await Effect.runPromise(
      runOrderExport.pipe(Effect.provide(mainLayer)),
    );

    expect(enriched.map(({ id }) => id)).toEqual(
      lines.map(({ id }) => id),
    );
    expect(enriched.map(({ product }) => product.id)).toEqual(
      lines.map(({ productId }) => productId),
    );
    expect(feed.calls()).toEqual(["page-1", "page-2", "page-3"]);
    expect(gateway.snapshot().active).toBe(0);
  });
});
