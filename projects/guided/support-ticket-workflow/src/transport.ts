import { Effect, Schema } from "effect";

import { executeTicketCommand } from "./application.js";
import {
  InvalidRequest,
  OpenTicketSchema,
  type TicketResponse,
} from "./domain.js";
import type { EventStore } from "./event-store.js";

// Этап 3: starter boundary принимает только уже работающий OpenTicket slice.
// Расширьте decoder до TicketCommandSchema; domain и defect handling не меняйте.
export const handleTicketRequest = (
  input: unknown,
): Effect.Effect<TicketResponse, never, EventStore> =>
  Effect.gen(function* () {
    const command = yield* Schema.decodeUnknownEffect(OpenTicketSchema)(
      input,
    ).pipe(
      Effect.mapError(
        (cause) =>
          new InvalidRequest({
            message: "Request does not match the ticket command contract",
            cause,
          }),
      ),
    );
    const state = yield* executeTicketCommand(command);
    return { status: "accepted" as const, state };
  }).pipe(
    Effect.catchTag("InvalidRequest", (error) =>
      Effect.succeed({
        status: "invalid-request" as const,
        message: error.message,
      }),
    ),
    Effect.catchTag("InvalidTransition", (error) =>
      Effect.succeed({
        status: "conflict" as const,
        command: error.command,
        from: error.from,
      }),
    ),
  );
