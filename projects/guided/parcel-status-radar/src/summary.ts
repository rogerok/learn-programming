import { Effect } from "effect";

import type { CarrierGatewayService } from "./carrier.js";
import type {
  ParcelLookupError,
  ParcelStatus,
  TrackingId,
} from "./domain.js";
import type { ScanOptions } from "./pipeline.js";
import { makeParcelLookup } from "./requests.js";

export interface HubSummary {
  readonly hub: string;
  readonly parcels: number;
}

const countByHub = (
  statuses: ReadonlyArray<ParcelStatus>,
): ReadonlyArray<HubSummary> => {
  const counts = new Map<string, number>();
  for (const status of statuses) {
    counts.set(status.hub, (counts.get(status.hub) ?? 0) + 1);
  }
  return Array.from(counts, ([hub, parcels]) => ({ hub, parcels })).sort(
    (left, right) => left.hub.localeCompare(right.hub),
  );
};

/**
 * Independent transfer: baseline вычисляет правильный summary, но выполняет
 * lookup-и последовательно. Учащийся переносит Stream/request boundary сам.
 */
export const summarizeByHub = (
  trackingIds: ReadonlyArray<TrackingId>,
  gateway: CarrierGatewayService,
  options: ScanOptions,
): Effect.Effect<ReadonlyArray<HubSummary>, ParcelLookupError> => {
  const lookup = makeParcelLookup(gateway, {
    batchSize: options.batchSize,
    resilience: options.resilience,
  });

  return Effect.forEach(trackingIds, lookup.lookup).pipe(
    Effect.map(countByHub),
  );
};
