import { Context, Effect, Layer } from "effect";

import {
  OrderFeedError,
  ProductNotFound,
  type CatalogError,
  type CatalogUnavailable,
  type OrderPage,
  type Product,
} from "./domain.js";

export interface OrderFeedShape {
  readonly fetchPage: (
    cursor: string,
  ) => Effect.Effect<OrderPage, OrderFeedError>;
}

export class OrderFeed extends Context.Service<OrderFeed, OrderFeedShape>()(
  "guided-order-catalog-enricher/OrderFeed",
) {}

export interface CatalogGatewayShape {
  readonly getOne: (
    productId: string,
  ) => Effect.Effect<Product, CatalogError>;
  readonly getMany: (
    productIds: ReadonlyArray<string>,
  ) => Effect.Effect<ReadonlyMap<string, Product>, CatalogUnavailable>;
}

export class CatalogGateway extends Context.Service<
  CatalogGateway,
  CatalogGatewayShape
>()("guided-order-catalog-enricher/CatalogGateway") {}

export const makeOrderFeedLayer = (
  pages: ReadonlyMap<string, OrderPage>,
): Layer.Layer<OrderFeed> =>
  Layer.succeed(OrderFeed, {
    fetchPage: (cursor) =>
      Effect.gen(function* () {
        yield* Effect.sleep("5 millis");
        const page = pages.get(cursor);
        if (page === undefined) {
          return yield* Effect.fail(
            new OrderFeedError({
              cursor,
              message: "Unknown order-feed cursor",
            }),
          );
        }
        yield* Effect.log(`feed fetched ${cursor}`);
        return page;
      }),
  });

export const makeCatalogGatewayLayer = (
  products: ReadonlyMap<string, Product>,
): Layer.Layer<CatalogGateway> =>
  Layer.succeed(CatalogGateway, {
    getOne: (productId) =>
      Effect.gen(function* () {
        yield* Effect.sleep("20 millis");
        const product = products.get(productId);
        if (product === undefined) {
          return yield* Effect.fail(new ProductNotFound({ productId }));
        }
        yield* Effect.log(`catalog getOne ${productId}`);
        return product;
      }),
    getMany: (productIds) =>
      Effect.gen(function* () {
        yield* Effect.sleep("20 millis");
        yield* Effect.log(`catalog getMany [${productIds.join(", ")}]`);
        return new Map(
          productIds.flatMap((productId) => {
            const product = products.get(productId);
            return product === undefined ? [] : [[productId, product] as const];
          }),
        );
      }),
  });
