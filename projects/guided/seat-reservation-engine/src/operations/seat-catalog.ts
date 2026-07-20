import { Data, Duration, Effect } from "effect";

import type { SeatId } from "../domain.js";

export interface SeatDetails {
  readonly id: SeatId;
  readonly section: string;
  readonly price: number;
}

export class SeatCatalogError extends Data.TaggedError("SeatCatalogError")<{
  readonly seatId?: SeatId;
  readonly message: string;
  readonly cause?: unknown;
}> {}

export type FetchSeatBatch = (
  seatIds: ReadonlyArray<SeatId>,
) => Effect.Effect<ReadonlyArray<SeatDetails>, SeatCatalogError>;

export interface SeatCatalogOptions {
  readonly batchSize: number;
  readonly capacity: number;
  readonly timeToLive: Duration.DurationInput;
}

export interface SeatCatalogService {
  readonly get: (
    seatId: SeatId,
  ) => Effect.Effect<SeatDetails, SeatCatalogError>;
  readonly invalidate: (seatId: SeatId) => Effect.Effect<void>;
}

/**
 * The starter performs one upstream request per lookup and keeps no cache. It
 * is a coherent direct client; Iteration 2 adds RequestResolver and Cache.
 */
export const makeSeatCatalog = (
  fetchBatch: FetchSeatBatch,
  options: SeatCatalogOptions,
): Effect.Effect<SeatCatalogService> => {
  if (
    !Number.isInteger(options.batchSize) ||
    options.batchSize < 1 ||
    !Number.isInteger(options.capacity) ||
    options.capacity < 1
  ) {
    return Effect.die(
      new Error("Catalog batch size and capacity must be positive integers"),
    );
  }

  return Effect.succeed({
    get: (seatId) =>
      fetchBatch([seatId]).pipe(
        Effect.flatMap((details) => {
          const found = details.find((seat) => seat.id === seatId);
          return found === undefined
            ? Effect.fail(
                new SeatCatalogError({
                  seatId,
                  message: `Seat ${seatId} is absent from the catalog response`,
                }),
              )
            : Effect.succeed(found);
        }),
      ),
    invalidate: () => Effect.void,
  });
};
