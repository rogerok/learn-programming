import { Context, Effect, Layer } from "effect";

import type {
  CarrierUnavailable,
  ParcelStatus,
  TrackingId,
} from "./domain.js";

export interface CarrierGatewayService {
  readonly fetchBatch: (
    trackingIds: ReadonlyArray<TrackingId>,
  ) => Effect.Effect<ReadonlyArray<ParcelStatus>, CarrierUnavailable>;
}

export const CarrierGateway = Context.GenericTag<CarrierGatewayService>(
  "ParcelStatusRadar/CarrierGateway",
);

const demoStatuses: Record<TrackingId, ParcelStatus> = {
  "PKG-101": {
    trackingId: "PKG-101",
    state: "in_transit",
    hub: "Riga",
  },
  "PKG-102": {
    trackingId: "PKG-102",
    state: "delayed",
    hub: "Berlin",
  },
  "PKG-103": {
    trackingId: "PKG-103",
    state: "delivered",
    hub: "Prague",
  },
  "PKG-104": {
    trackingId: "PKG-104",
    state: "in_transit",
    hub: "Berlin",
  },
};

export const demoCarrierGateway: CarrierGatewayService = {
  fetchBatch: (trackingIds) =>
    Effect.sleep("10 millis").pipe(
      Effect.as(
        trackingIds.flatMap((trackingId) => {
          const status = demoStatuses[trackingId];
          return status === undefined ? [] : [status];
        }),
      ),
    ),
};

export const CarrierGatewayDemo = Layer.succeed(
  CarrierGateway,
  demoCarrierGateway,
);
