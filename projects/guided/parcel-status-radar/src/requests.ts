import { Effect } from "effect";

import type { CarrierGatewayService } from "./carrier.js";
import {
  ParcelNotFound,
  type ParcelLookupError,
  type ParcelStatus,
  type TrackingId,
} from "./domain.js";
import {
  fetchBatchWithPolicy,
  type ResilienceOptions,
} from "./resilience.js";

export interface ParcelLookupOptions {
  readonly batchSize: number;
  readonly resilience: ResilienceOptions;
}

export interface ParcelLookupService {
  readonly lookup: (
    trackingId: TrackingId,
  ) => Effect.Effect<ParcelStatus, ParcelLookupError>;
}

/**
 * Этап 2: baseline является полноценным direct client — один lookup делает
 * один singleton gateway call. Request и RequestResolver добавляются позже.
 */
export const makeParcelLookup = (
  gateway: CarrierGatewayService,
  options: ParcelLookupOptions,
): ParcelLookupService => ({
  lookup: (trackingId) =>
    fetchBatchWithPolicy(
      gateway.fetchBatch,
      [trackingId],
      options.resilience,
    ).pipe(
      Effect.flatMap((statuses) => {
        const status = statuses.find(
          (candidate) => candidate.trackingId === trackingId,
        );
        return status === undefined
          ? Effect.fail(new ParcelNotFound({ trackingId }))
          : Effect.succeed(status);
      }),
    ),
});
