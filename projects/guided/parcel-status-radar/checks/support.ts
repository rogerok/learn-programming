import { Effect } from "effect";

import type { CarrierGatewayService } from "../src/carrier.js";
import type {
  ParcelState,
  ParcelStatus,
  TrackingId,
} from "../src/domain.js";
import {
  defaultScanOptions,
  type ScanOptions,
} from "../src/pipeline.js";

export const status = (
  trackingId: TrackingId,
  state: ParcelState,
  hub: string,
): ParcelStatus => ({ trackingId, state, hub });

export interface GatewayHarnessOptions {
  readonly delayMs?: number;
  readonly delayByTrackingId?: Readonly<Record<TrackingId, number>>;
}

export const makeGatewayHarness = (
  statuses: ReadonlyArray<ParcelStatus>,
  options: GatewayHarnessOptions = {},
) => {
  const statusById = new Map(
    statuses.map((parcelStatus) => [parcelStatus.trackingId, parcelStatus]),
  );
  const calls: Array<ReadonlyArray<TrackingId>> = [];
  let active = 0;
  let maximumActive = 0;

  const gateway: CarrierGatewayService = {
    fetchBatch: (trackingIds) => {
      const delayMs = Math.max(
        options.delayMs ?? 0,
        ...trackingIds.map(
          (trackingId) => options.delayByTrackingId?.[trackingId] ?? 0,
        ),
      );

      return Effect.acquireUseRelease(
        Effect.sync(() => {
          calls.push([...trackingIds]);
          active += 1;
          maximumActive = Math.max(maximumActive, active);
        }),
        () =>
          Effect.sleep(`${delayMs} millis`).pipe(
            Effect.as(
              trackingIds.flatMap((trackingId) => {
                const parcelStatus = statusById.get(trackingId);
                return parcelStatus === undefined ? [] : [parcelStatus];
              }),
            ),
          ),
        () =>
          Effect.sync(() => {
            active -= 1;
          }),
      );
    },
  };

  return {
    gateway,
    calls,
    get maximumActive() {
      return maximumActive;
    },
  };
};

export const makeScanOptions = (
  overrides: Partial<Omit<ScanOptions, "resilience">> & {
    readonly resilience?: Partial<ScanOptions["resilience"]>;
  } = {},
): ScanOptions => ({
  ...defaultScanOptions,
  ...overrides,
  resilience: {
    ...defaultScanOptions.resilience,
    ...overrides.resilience,
  },
});
