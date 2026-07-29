import { describe, expect, it } from "vitest";
import { Effect } from "effect";

import {
  CarrierNotFound,
  enrichShipments,
  type Carrier,
  type CarrierGatewayShape,
  type Shipment,
} from "../src/transfer.js";

describe("independent transfer: carrier batching without Stream", () => {
  it("coalesces Effect.forEach demand into batches of at most three", async () => {
    const shipments: ReadonlyArray<Shipment> = Array.from(
      { length: 7 },
      (_, index) => ({
        id: `shipment-${index + 1}`,
        carrierId: `carrier-${index + 1}`,
      }),
    );
    const carriers = new Map<string, Carrier>(
      shipments.map(({ carrierId }, index) => [
        carrierId,
        { id: carrierId, name: `Carrier ${index + 1}` },
      ]),
    );
    const singleCalls: Array<string> = [];
    const bulkCalls: Array<ReadonlyArray<string>> = [];

    const gateway: CarrierGatewayShape = {
      getOne: (carrierId) => {
        singleCalls.push(carrierId);
        const carrier = carriers.get(carrierId);
        return carrier === undefined
          ? Effect.fail(new CarrierNotFound({ carrierId }))
          : Effect.succeed(carrier);
      },
      getMany: (carrierIds) => {
        bulkCalls.push([...carrierIds]);
        return Effect.succeed(
          new Map(
            carrierIds.flatMap((carrierId) => {
              const carrier = carriers.get(carrierId);
              return carrier === undefined
                ? []
                : [[carrierId, carrier] as const];
            }),
          ),
        );
      },
    };

    const enriched = await Effect.runPromise(
      enrichShipments(shipments, gateway),
    );

    expect(singleCalls).toEqual([]);
    expect(bulkCalls).toEqual([
      ["carrier-1", "carrier-2", "carrier-3"],
      ["carrier-4", "carrier-5", "carrier-6"],
      ["carrier-7"],
    ]);
    expect(enriched.map(({ id }) => id)).toEqual(
      shipments.map(({ id }) => id),
    );
    expect(enriched.map(({ carrier }) => carrier.id)).toEqual(
      shipments.map(({ carrierId }) => carrierId),
    );
  });
});
