import { Deferred, Effect, Layer, Option } from "effect";

import type { CatalogLoaderShape } from "../src/catalog-loader.js";
import {
  ProductNotFound,
  type OrderLine,
  type OrderPage,
  type Product,
} from "../src/domain.js";
import {
  CatalogGateway,
  OrderFeed,
  type CatalogGatewayShape,
  type OrderFeedShape,
} from "../src/services.js";

export const makeOrderLines = (count = 9): ReadonlyArray<OrderLine> =>
  Array.from({ length: count }, (_, index) => ({
    id: `line-${index + 1}`,
    productId: `product-${index + 1}`,
    quantity: (index % 3) + 1,
  }));

export const makeProducts = (
  lines: ReadonlyArray<OrderLine>,
): ReadonlyMap<string, Product> =>
  new Map(
    lines.map(({ productId }, index) => [
      productId,
      {
        id: productId,
        name: `Product ${index + 1}`,
        priceCents: (index + 1) * 100,
      },
    ]),
  );

export const makeOrderFeedHarness = (
  lines: ReadonlyArray<OrderLine> = makeOrderLines(),
) => {
  const calls: Array<string> = [];
  const pages = new Map<string, OrderPage>([
    [
      "page-1",
      { lines: lines.slice(0, 4), nextCursor: Option.some("page-2") },
    ],
    [
      "page-2",
      { lines: lines.slice(4, 8), nextCursor: Option.some("page-3") },
    ],
    ["page-3", { lines: lines.slice(8), nextCursor: Option.none() }],
  ]);

  const service: OrderFeedShape = {
    fetchPage: (cursor) =>
      Effect.suspend(() => {
        calls.push(cursor);
        const page = pages.get(cursor);
        return page === undefined
          ? Effect.die(new Error(`Unexpected cursor: ${cursor}`))
          : Effect.succeed(page);
      }),
  };

  return {
    service,
    layer: Layer.succeed(OrderFeed, service),
    calls: (): ReadonlyArray<string> => [...calls],
  };
};

export interface CatalogGatewaySnapshot {
  readonly active: number;
  readonly maxActive: number;
  readonly singleCalls: ReadonlyArray<string>;
  readonly bulkCalls: ReadonlyArray<ReadonlyArray<string>>;
}

export const makeCatalogGatewayHarness = (
  products: ReadonlyMap<string, Product>,
) => {
  let active = 0;
  let maxActive = 0;
  const singleCalls: Array<string> = [];
  const bulkCalls: Array<ReadonlyArray<string>> = [];

  const tracked = <A, E>(effect: Effect.Effect<A, E>): Effect.Effect<A, E> =>
    Effect.gen(function* () {
      active += 1;
      maxActive = Math.max(maxActive, active);
      return yield* effect;
    }).pipe(
      Effect.ensuring(
        Effect.sync(() => {
          active -= 1;
        }),
      ),
    );

  const service: CatalogGatewayShape = {
    getOne: (productId) => {
      singleCalls.push(productId);
      const product = products.get(productId);
      return tracked(
        product === undefined
          ? Effect.fail(new ProductNotFound({ productId }))
          : Effect.succeed(product),
      );
    },
    getMany: (productIds) => {
      bulkCalls.push([...productIds]);
      return tracked(
        Effect.succeed(
          new Map(
            productIds.flatMap((productId) => {
              const product = products.get(productId);
              return product === undefined
                ? []
                : [[productId, product] as const];
            }),
          ),
        ),
      );
    },
  };

  return {
    service,
    layer: Layer.succeed(CatalogGateway, service),
    snapshot: (): CatalogGatewaySnapshot => ({
      active,
      maxActive,
      singleCalls: [...singleCalls],
      bulkCalls: bulkCalls.map((batch) => [...batch]),
    }),
  };
};

export const makeBlockingLoaderHarness = (
  products: ReadonlyMap<string, Product>,
) =>
  Effect.gen(function* () {
    const gate = yield* Deferred.make<void>();
    let active = 0;
    let maxActive = 0;
    const started: Array<string> = [];

    const service: CatalogLoaderShape = {
      get: (productId) => {
        const product = products.get(productId);
        const operation = Effect.gen(function* () {
          active += 1;
          maxActive = Math.max(maxActive, active);
          started.push(productId);
          yield* Deferred.await(gate);
          if (product === undefined) {
            return yield* Effect.fail(new ProductNotFound({ productId }));
          }
          return product;
        });

        return operation.pipe(
          Effect.ensuring(
            Effect.sync(() => {
              active -= 1;
            }),
          ),
        );
      },
    };

    return {
      service,
      release: Deferred.succeed(gate, undefined),
      snapshot: () => ({
        active,
        maxActive,
        started: [...started] as ReadonlyArray<string>,
      }),
    };
  });
