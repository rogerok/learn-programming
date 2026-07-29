import { Effect } from "effect";

import type { CarrierGatewayService } from "./carrier.js";
import type { ParcelReportRow, TrackingId } from "./domain.js";
import { makeParcelLookup } from "./requests.js";
import {
  defaultResilienceOptions,
  type ResilienceOptions,
} from "./resilience.js";

export interface ScanOptions {
  readonly concurrency: number;
  readonly batchSize: number;
  readonly resilience: ResilienceOptions;
}

export const defaultScanOptions: ScanOptions = {
  concurrency: 3,
  batchSize: 3,
  resilience: defaultResilienceOptions,
};


/**
 * Этап 1: baseline последовательно обогащает все IDs. Он уже возвращает полный
 * отчёт и изолирует ошибку одной посылки, но пока не использует Stream.
 */
export const scanParcels = (
  trackingIds: ReadonlyArray<TrackingId>,
  gateway: CarrierGatewayService,
  options: ScanOptions,
): Effect.Effect<ReadonlyArray<ParcelReportRow>> => {
  const lookup = makeParcelLookup(gateway, {
    batchSize: options.batchSize,
    resilience: options.resilience,
  });

  return Effect.forEach(trackingIds, (trackingId, index) =>
    lookup.lookup(trackingId).pipe(
      Effect.match({
        onFailure: (error): ParcelReportRow => ({
          _tag: "Failed",
          index,
          trackingId,
          error,
        }),
        onSuccess: (status): ParcelReportRow => ({
          _tag: "Found",
          index,
          trackingId,
          status,
        }),
      }),
    ),
  );
};
