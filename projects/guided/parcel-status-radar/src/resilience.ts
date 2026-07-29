import type { Effect } from "effect";

import type {
  CarrierTimeout,
  CarrierUnavailable,
  ParcelStatus,
  TrackingId,
} from "./domain.js";

export interface ResilienceOptions {
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
}

export const defaultResilienceOptions: ResilienceOptions = {
  timeoutMs: 250,
  maxRetries: 2,
  initialDelayMs: 20,
  maxDelayMs: 100,
};

export type FetchParcelBatch = (
  trackingIds: ReadonlyArray<TrackingId>,
) => Effect.Effect<ReadonlyArray<ParcelStatus>, CarrierUnavailable>;

/**
 * Этап 3: baseline выполняет одну корректную gateway attempt. В GUIDE эта
 * рабочая версия расширяется timeout-ом каждой попытки и selective retry.
 */
export const fetchBatchWithPolicy = (
  fetchBatch: FetchParcelBatch,
  trackingIds: ReadonlyArray<TrackingId>,
  options: ResilienceOptions,
): Effect.Effect<
  ReadonlyArray<ParcelStatus>,
  CarrierUnavailable | CarrierTimeout
> => {
  void options;
  return fetchBatch(trackingIds);
};
