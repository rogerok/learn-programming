import { Data } from "effect";
import type { Option } from "effect";

export interface OrderLine {
  readonly id: string;
  readonly productId: string;
  readonly quantity: number;
}

export interface OrderPage {
  readonly lines: ReadonlyArray<OrderLine>;
  readonly nextCursor: Option.Option<string>;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
}

export interface EnrichedOrderLine extends OrderLine {
  readonly product: Product;
  readonly lineTotalCents: number;
}

export class OrderFeedError extends Data.TaggedError("OrderFeedError")<{
  readonly cursor: string;
  readonly message: string;
}> {}

export class CatalogUnavailable extends Data.TaggedError(
  "CatalogUnavailable",
)<{
  readonly operation: "getOne" | "getMany";
}> {}

export class ProductNotFound extends Data.TaggedError("ProductNotFound")<{
  readonly productId: string;
}> {}

export type CatalogError = CatalogUnavailable | ProductNotFound;
