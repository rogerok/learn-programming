import { Context, Effect, Layer, Stream } from "effect";

import type {
  BookingEvent,
  Reservation,
  ReservationIdSchema,
  SeatId,
  VenueSnapshot,
} from "../domain.js";
import type { BookingError } from "../errors.js";

export interface HoldInput {
  readonly seats: ReadonlyArray<SeatId>;
  readonly durationMs: number;
}

export interface ConfirmInput {
  readonly reservationId: ReservationIdSchema;
  readonly amount: number;
}

export interface BookingOperationsService {
  readonly status: Effect.Effect<VenueSnapshot>;
  readonly hold: (input: HoldInput) => Effect.Effect<Reservation, BookingError>;
  readonly confirm: (input: ConfirmInput) => Effect.Effect<Reservation, BookingError>;
  readonly cancel: (reservationId: ReservationIdSchema) => Effect.Effect<void, BookingError>;
  readonly events: Stream.Stream<BookingEvent>;
}

export const BookingOperations = Context.GenericTag<BookingOperationsService>(
  "SeatReservation/Operations/BookingOperations",
);

export const makeBookingOperationsLayer = (
  service: BookingOperationsService,
): Layer.Layer<BookingOperationsService> => Layer.succeed(BookingOperations, service);
