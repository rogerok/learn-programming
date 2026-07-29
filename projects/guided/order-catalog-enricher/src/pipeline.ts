import { Effect, Option, Stream } from "effect";

import { CatalogLoader, type CatalogLoaderShape } from "./catalog-loader.js";
import type {
  CatalogError,
  EnrichedOrderLine,
  OrderFeedError,
  OrderLine,
} from "./domain.js";
import { OrderFeed, type OrderFeedShape } from "./services.js";

export const FIRST_PAGE_CURSOR = "page-1";

/**
 * Этап 1: baseline сначала загружает все страницы и лишь затем начинает
 * эмитить элементы. Результат правильный, но источник пока не ленивый.
 */
export const makeOrderLineStream = (
  feed: OrderFeedShape,
): Stream.Stream<OrderLine, OrderFeedError> =>
  Stream.fromIterableEffect(
    Effect.gen(function* () {
      const lines: Array<OrderLine> = [];
      let cursor: Option.Option<string> = Option.some(FIRST_PAGE_CURSOR);

      while (Option.isSome(cursor)) {
        const page = yield* feed.fetchPage(cursor.value);
        lines.push(...page.lines);
        cursor = page.nextCursor;
      }

      return lines;
    }),
  );

/**
 * Этап 2: get уже асинхронный, но baseline запускает только один lookup за
 * раз. См. GUIDE.md#milestone-2.
 */
export const enrichOrderLines = <E, R>(
  source: Stream.Stream<OrderLine, E, R>,
  loader: CatalogLoaderShape,
): Stream.Stream<EnrichedOrderLine, E | CatalogError, R> =>
  source.pipe(
    Stream.mapEffect(
      (line) =>
        loader.get(line.productId).pipe(
          Effect.map((product): EnrichedOrderLine => ({
            ...line,
            product,
            lineTotalCents: product.priceCents * line.quantity,
          })),
        ),
      { concurrency: 1 },
    ),
  );

export const runOrderExport = Effect.gen(function* () {
  const feed = yield* OrderFeed;
  const loader = yield* CatalogLoader;
  return yield* enrichOrderLines(makeOrderLineStream(feed), loader).pipe(
    Stream.runCollect,
  );
});
