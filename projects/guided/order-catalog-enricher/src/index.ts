import { Effect, Layer, Option } from "effect";

import { CatalogLoaderLive } from "./catalog-loader.js";
import type { OrderLine, OrderPage, Product } from "./domain.js";
import { runOrderExport } from "./pipeline.js";
import {
  makeCatalogGatewayLayer,
  makeOrderFeedLayer,
} from "./services.js";

const orderLines: ReadonlyArray<OrderLine> = Array.from(
  { length: 9 },
  (_, index) => ({
    id: `line-${index + 1}`,
    productId: `product-${index + 1}`,
    quantity: (index % 3) + 1,
  }),
);

const pages = new Map<string, OrderPage>([
  [
    "page-1",
    { lines: orderLines.slice(0, 4), nextCursor: Option.some("page-2") },
  ],
  [
    "page-2",
    { lines: orderLines.slice(4, 8), nextCursor: Option.some("page-3") },
  ],
  ["page-3", { lines: orderLines.slice(8), nextCursor: Option.none() }],
]);

const products = new Map<string, Product>(
  orderLines.map(({ productId }, index) => [
    productId,
    {
      id: productId,
      name: `Product ${index + 1}`,
      priceCents: (index + 1) * 125,
    },
  ]),
);

const CatalogLoaderDemo = CatalogLoaderLive.pipe(
  Layer.provide(makeCatalogGatewayLayer(products)),
);

const MainLayer = Layer.merge(makeOrderFeedLayer(pages), CatalogLoaderDemo);

const program = runOrderExport.pipe(
  Effect.provide(MainLayer),
  Effect.tap((lines) =>
    Effect.log(
      `order export completed: ${lines.length} enriched lines, total ${lines.reduce((sum, line) => sum + line.lineTotalCents, 0)} cents`,
    ),
  ),
);

Effect.runPromise(program).catch((cause: unknown) => {
  console.error(cause);
  process.exitCode = 1;
});
