import { Data, Effect, Schema } from "effect";

// export const SeatIdSchema = Schema.String.pipe(Schema.brand("SeatIdSW"));
// export const ReservationIdSchema = Schema.String.pipe(Schema.brand("ReservationId"));
// export const AidIdSchema = Schema.String.pipe(Schema.brand("AidId"));

export const SeatIdSchema = Schema.String.pipe(Schema.minLength(1));
export const ReservationIdSchema = Schema.String.pipe(Schema.minLength(1));
export const AidIdSchema = Schema.String.pipe(Schema.minLength(1));

export type SeatId = Schema.Schema.Type<typeof SeatIdSchema>;
export type ReservationId = Schema.Schema.Type<typeof ReservationIdSchema>;
export type AidId = Schema.Schema.Type<typeof AidIdSchema>;

export const BookingCommandStatusSchema = Schema.Struct({
  type: Schema.Literal("status"),
});
export const BookingCommandHoldSchema = Schema.Struct({
  type: Schema.Literal("hold"),
  seats: Schema.NonEmptyArray(SeatIdSchema).pipe(
    Schema.filter((seats) => seats.length === new Set(seats).size),
  ),
  // TODO: возможно сменить на Duration
  durationMs: Schema.Number.pipe(Schema.finite(), Schema.positive()),
});
export const BookingCommandConfirmSchema = Schema.Struct({
  type: Schema.Literal("confirm"),
  reservationId: ReservationIdSchema,
  amount: Schema.Number.pipe(Schema.positive(), Schema.finite()),
});
export const BookingCommandCancelSchema = Schema.Struct({
  type: Schema.Literal("cancel"),
  reservationId: ReservationIdSchema,
});

export const BookingCommandSchema = Schema.Union(
  BookingCommandStatusSchema,
  BookingCommandHoldSchema,
  BookingCommandConfirmSchema,
  BookingCommandCancelSchema,
);
export type BookingCommand = Schema.Schema.Type<typeof BookingCommandSchema>;

export class InvalidCommand extends Data.TaggedError("InvalidCommand")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * Этап 1 — learner seam: baseline распознаёт только верхнее поле `type`, но
 * доверяет вложенным данным. Замените эту границу на Schema decode по GUIDE.md,
 * сохранив публичную ошибку InvalidCommand.
 */
export const decodeBookingCommand = (
  input: unknown,
): Effect.Effect<BookingCommand, InvalidCommand> =>
  Schema.decodeUnknown(BookingCommandSchema)(input).pipe(
    Effect.mapError(
      (cause) => new InvalidCommand({ cause, message: "Cannot decode booking command" }),
    ),
  );

export interface Reservation {
  readonly id: ReservationId;
  readonly seats: ReadonlyArray<SeatId>;
  readonly aids: ReadonlyArray<AidId>;
  readonly expiresAt: number;
  readonly status: "held" | "confirmed" | "cancelled";
}

export interface VenueSnapshot {
  readonly availableSeats: ReadonlyArray<SeatId>;
  readonly heldSeats: ReadonlyArray<SeatId>;
  readonly bookedSeats: ReadonlyArray<SeatId>;
  readonly availableAids: ReadonlyArray<AidId>;
  readonly reservations: ReadonlyArray<Reservation>;
}

export type BookingEvent =
  | { readonly _tag: "ReservationHeld"; readonly reservation: Reservation }
  | {
      readonly _tag: "ReservationConfirmed";
      readonly reservation: Reservation;
    }
  | {
      readonly _tag: "ReservationRejected";
      readonly seats: ReadonlyArray<SeatId>;
      readonly reason: unknown;
    };
