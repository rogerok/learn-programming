import { Data } from "effect";

export interface Notification {
  readonly id: string;
  readonly recipient: string;
  readonly message: string;
}

export interface GatewayReceipt {
  readonly gatewayBatchId: string;
  readonly acceptedIds: ReadonlyArray<string>;
}

export class SourceError extends Data.TaggedError("SourceError")<{
  readonly message: string;
}> {}

export class GatewayUnavailable extends Data.TaggedError(
  "GatewayUnavailable",
)<{
  readonly batchKey: string;
}> {}

export class BatchRejected extends Data.TaggedError("BatchRejected")<{
  readonly batchKey: string;
  readonly reason: string;
}> {}

export type GatewayError = GatewayUnavailable | BatchRejected;

export type BatchOutcome =
  | {
      readonly _tag: "Delivered";
      readonly notificationIds: ReadonlyArray<string>;
      readonly gatewayBatchId: string;
    }
  | {
      readonly _tag: "Failed";
      readonly notificationIds: ReadonlyArray<string>;
      readonly reason: GatewayError["_tag"];
    };

export const batchKeyOf = (
  batch: ReadonlyArray<Notification>,
): string => batch.map((notification) => notification.id).join("+");
