import { Data } from "effect";

export type TrackingId = string;

export type ParcelState = "in_transit" | "delayed" | "delivered";

export interface ParcelStatus {
  readonly trackingId: TrackingId;
  readonly state: ParcelState;
  readonly hub: string;
}

export class ParcelNotFound extends Data.TaggedError("ParcelNotFound")<{
  readonly trackingId: TrackingId;
}> {}

export class CarrierUnavailable extends Data.TaggedError(
  "CarrierUnavailable",
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class CarrierTimeout extends Data.TaggedError("CarrierTimeout")<{
  readonly trackingIds: ReadonlyArray<TrackingId>;
  readonly timeoutMs: number;
}> {}

export type ParcelLookupError =
  | ParcelNotFound
  | CarrierUnavailable
  | CarrierTimeout;

export type ParcelReportRow =
  | {
      readonly _tag: "Found";
      readonly index: number;
      readonly trackingId: TrackingId;
      readonly status: ParcelStatus;
    }
  | {
      readonly _tag: "Failed";
      readonly index: number;
      readonly trackingId: TrackingId;
      readonly error: ParcelLookupError;
    };
