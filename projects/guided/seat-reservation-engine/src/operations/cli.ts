import { Command } from "@effect/cli";
import { Console, Data, Effect } from "effect";

import type { ReservationId, ReservationIdSchema, SeatId } from "../domain.js";
import type { BookingError } from "../errors.js";
import { BookingOperations, type BookingOperationsService } from "./application.js";

export type CliAction =
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

export class UnsupportedCliAction extends Data.TaggedError("UnsupportedCliAction")<{
  readonly action: Exclude<CliAction["type"], "status">;
}> {}

/**
 * A transport-neutral seam used by the @effect/cli handlers. The starter
 * dispatches status; later subcommands reuse this function instead of
 * duplicating booking workflows.
 */
export const executeCliAction = (
  action: CliAction,
): Effect.Effect<unknown, BookingError | UnsupportedCliAction, BookingOperationsService> =>
  Effect.gen(function* () {
    const operations = yield* BookingOperations;
    if (action.type === "status") {
      return yield* operations.status;
    }
    return yield* new UnsupportedCliAction({ action: action.type });
  });

const statusCommand = Command.make("status", {}, () =>
  Effect.gen(function* () {
    const operations = yield* BookingOperations;
    const snapshot = yield* operations.status;
    yield* Console.log(
      JSON.stringify({
        availableSeats: snapshot.availableSeats,
        heldSeats: snapshot.heldSeats,
        bookedSeats: snapshot.bookedSeats,
      }),
    );
  }),
);

/**
 * The starter exposes a useful read-only command. Iteration 2 adds hold,
 * confirm, cancel, and shared runtime wiring without duplicating workflows.
 */
export const seatEngineCommand = Command.make("seat-engine").pipe(
  Command.withSubcommands([statusCommand]),
);

export const runSeatEngineCli = Command.run(seatEngineCommand, {
  name: "Seat Reservation Engine",
  version: "2.0.0",
});
