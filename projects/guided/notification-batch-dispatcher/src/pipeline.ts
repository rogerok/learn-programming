import { Effect, Stream } from "effect";

import type { BatchOutcome, Notification, SourceError } from "./domain.js";
import { BatchGateway, NotificationSource } from "./services.js";

/**
 * Этап 3: baseline делает одну попытку и превращает её результат в BatchOutcome.
 * Поведение уже не обрывает весь Stream, но transient failure пока не повторяется.
 */
export const sendBatchWithPolicy = (
  batch: ReadonlyArray<Notification>,
): Effect.Effect<BatchOutcome, never, BatchGateway> =>
  Effect.gen(function* () {
    const gateway = yield* BatchGateway;
    return yield* gateway.sendBatch(batch);
  }).pipe(
    Effect.match({
      onFailure: (error): BatchOutcome => ({
        _tag: "Failed",
        notificationIds: batch.map(({ id }) => id),
        reason: error._tag,
      }),
      onSuccess: (receipt): BatchOutcome => ({
        _tag: "Delivered",
        notificationIds: batch.map(({ id }) => id),
        gatewayBatchId: receipt.gatewayBatchId,
      }),
    }),
  );

/**
 * Этапы 1–2: baseline отправляет singleton batches последовательно.
 * Это корректная, но неэффективная реализация; см. GUIDE.md#milestone-1.
 */
export const dispatchFixedBatches = (
  source: Stream.Stream<Notification, SourceError>,
): Stream.Stream<BatchOutcome, SourceError, BatchGateway> =>
  source.pipe(
    Stream.map((notification) => [notification]),
    Stream.mapEffect(sendBatchWithPolicy, { concurrency: 1 }),
  );

export const runDispatcher = Effect.gen(function* () {
  const source = yield* NotificationSource;
  return yield* dispatchFixedBatches(source.stream).pipe(Stream.runCollect);
});
