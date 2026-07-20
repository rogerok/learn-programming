import { Data, Effect } from "effect";

export type SeatId = string;
export type ReservationId = string;
export type AidId = string;

export type BookingCommand =
  | { readonly type: "status" }
  | {
      readonly type: "hold";
      readonly seats: ReadonlyArray<SeatId>;
      readonly durationMs: number;
    }
  | {
      readonly type: "confirm";
      readonly reservationId: ReservationId;
      readonly amount: number;
    }
  | { readonly type: "cancel"; readonly reservationId: ReservationId };

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
  Effect.try({
    try: () => {
      if (typeof input !== "object" || input === null || !("type" in input)) {
        throw new TypeError("Command must be an object with a type");
      }

      const command = input as BookingCommand;
      if (
        command.type !== "status" &&
        command.type !== "hold" &&
        command.type !== "confirm" &&
        command.type !== "cancel"
      ) {
        throw new TypeError("Unknown command type");
      }

      return command;
    },
    catch: (cause) =>
      new InvalidCommand({ message: "Cannot decode booking command", cause }),
  });

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
