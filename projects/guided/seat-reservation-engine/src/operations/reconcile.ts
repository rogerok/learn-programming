import { Data, Effect, Stream } from "effect";

import type { SeatId } from "../domain.js";
import type {
  SeatCatalogError,
  SeatCatalogService,
} from "./seat-catalog.js";

interface ReconciliationRecord {
  readonly reservationId: string;
  readonly seats: ReadonlyArray<SeatId>;
}

export interface ReconciliationReport {
  readonly processedReservations: number;
  readonly seatLookups: number;
  readonly totalPrice: number;
}

export class ReconciliationInputError extends Data.TaggedError(
  "ReconciliationInputError",
)<{
  readonly line: string;
  readonly cause: unknown;
}> {}

const decodeRecord = (
  line: string,
): Effect.Effect<ReconciliationRecord, ReconciliationInputError> =>
  Effect.try({
    try: () => {
      const value: unknown = JSON.parse(line);
      if (
        typeof value !== "object" ||
        value === null ||
        !("reservationId" in value) ||
        typeof value.reservationId !== "string" ||
        !("seats" in value) ||
        !Array.isArray(value.seats) ||
        !value.seats.every((seat) => typeof seat === "string")
      ) {
        throw new TypeError("Invalid reconciliation record");
      }
      return {
        reservationId: value.reservationId,
        seats: value.seats,
      };
    },
    catch: (cause) => new ReconciliationInputError({ line, cause }),
  });

/**
 * The starter reconciles one record at a time. It is correct for small files;
 * the transfer replaces the sequential lookup boundary with bounded batching.
 */
export const reconcileBookingLog = (
  lines: Stream.Stream<string>,
  catalog: SeatCatalogService,
): Effect.Effect<
  ReconciliationReport,
  ReconciliationInputError | SeatCatalogError
> =>
  lines.pipe(
    Stream.mapEffect(decodeRecord),
    Stream.runFoldEffect(
      {
        processedReservations: 0,
        seatLookups: 0,
        totalPrice: 0,
      } satisfies ReconciliationReport,
      (report, record) =>
        Effect.forEach(record.seats, catalog.get).pipe(
          Effect.map((details) => ({
            processedReservations: report.processedReservations + 1,
            seatLookups: report.seatLookups + details.length,
            totalPrice:
              report.totalPrice +
              details.reduce((sum, seat) => sum + seat.price, 0),
          })),
        ),
    ),
  );
