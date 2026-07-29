import { Data, Effect } from "effect";

export interface Shipment {
  readonly id: string;
  readonly carrierId: string;
}

export interface Carrier {
  readonly id: string;
  readonly name: string;
}

export interface EnrichedShipment extends Shipment {
  readonly carrier: Carrier;
}

export class CarrierNotFound extends Data.TaggedError("CarrierNotFound")<{
  readonly carrierId: string;
}> {}

export interface CarrierGatewayShape {
  readonly getOne: (
    carrierId: string,
  ) => Effect.Effect<Carrier, CarrierNotFound>;
  readonly getMany: (
    carrierIds: ReadonlyArray<string>,
  ) => Effect.Effect<ReadonlyMap<string, Carrier>>;
}

/**
 * Независимый transfer: baseline корректно обогащает shipments, но выполняет
 * семь последовательных getOne. Требуемое bulk-поведение описано в GUIDE.md.
 */
export const enrichShipments = (
  shipments: ReadonlyArray<Shipment>,
  gateway: CarrierGatewayShape,
): Effect.Effect<ReadonlyArray<EnrichedShipment>, CarrierNotFound> =>
  Effect.forEach(
    shipments,
    (shipment) =>
      gateway.getOne(shipment.carrierId).pipe(
        Effect.map((carrier) => ({ ...shipment, carrier })),
      ),
    { concurrency: 1 },
  );
