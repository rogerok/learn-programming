import { Context, Effect, Layer, Stream } from "effect";

import type {
  GatewayError,
  GatewayReceipt,
  Notification,
  SourceError,
} from "./domain.js";
import { batchKeyOf } from "./domain.js";

export interface NotificationSourceShape {
  readonly stream: Stream.Stream<Notification, SourceError>;
}

export class NotificationSource extends Context.Service<
  NotificationSource,
  NotificationSourceShape
>()("guided-notification-batch-dispatcher/NotificationSource") {}

export interface BatchGatewayShape {
  readonly sendBatch: (
    batch: ReadonlyArray<Notification>,
  ) => Effect.Effect<GatewayReceipt, GatewayError>;
}

export class BatchGateway extends Context.Service<
  BatchGateway,
  BatchGatewayShape
>()("guided-notification-batch-dispatcher/BatchGateway") {}

export const makeNotificationSourceLayer = (
  notifications: ReadonlyArray<Notification>,
) =>
  Layer.succeed(NotificationSource, {
    stream: Stream.fromIterable(notifications),
  });

export const BatchGatewayDemo = Layer.succeed(BatchGateway, {
  sendBatch: (batch) =>
    Effect.gen(function* () {
      yield* Effect.sleep("20 millis");
      const gatewayBatchId = `gateway-${batchKeyOf(batch)}`;
      yield* Effect.log(
        `gateway accepted [${batch.map(({ id }) => id).join(", ")}]`,
      );
      return {
        gatewayBatchId,
        acceptedIds: batch.map(({ id }) => id),
      } satisfies GatewayReceipt;
    }),
});
