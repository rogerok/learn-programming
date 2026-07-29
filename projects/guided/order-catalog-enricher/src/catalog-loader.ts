import { Context, Effect, Layer, Request, RequestResolver } from "effect";

import type { CatalogError, Product } from "./domain.js";
import { CatalogGateway } from "./services.js";

export interface GetProduct extends Request.Request<Product, CatalogError> {
  readonly _tag: "GetProduct";
  readonly productId: string;
}

export const GetProduct = Request.tagged<GetProduct>("GetProduct");

export interface CatalogLoaderShape {
  readonly get: (
    productId: string,
  ) => Effect.Effect<Product, CatalogError>;
}

export class CatalogLoader extends Context.Service<
  CatalogLoader,
  CatalogLoaderShape
>()("guided-order-catalog-enricher/CatalogLoader") {}

/**
 * Этап 3: baseline использует Request, но выполняет один getOne для каждой
 * entry. Публичный CatalogLoader уже готов; меняется только resolver.
 */
export const makeProductResolver = Effect.gen(function* () {
  const gateway = yield* CatalogGateway;
  return RequestResolver.fromEffect<GetProduct>((entry) =>
    gateway.getOne(entry.request.productId),
  );
});

export const makeCatalogLoader: Effect.Effect<
  CatalogLoaderShape,
  never,
  CatalogGateway
> = Effect.gen(function* () {
  const resolver = yield* makeProductResolver;
  return {
    get: (productId) =>
      Effect.request(GetProduct({ productId }), resolver),
  } satisfies CatalogLoaderShape;
});

export const CatalogLoaderLive = Layer.effect(
  CatalogLoader,
  makeCatalogLoader,
);
