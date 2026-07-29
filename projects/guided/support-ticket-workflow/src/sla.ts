import { Effect, Schema } from "effect";

import { replay } from "./decider.js";
import {
  InvalidRequest,
  SlaSignalSchema,
  type TicketState,
} from "./domain.js";
import { EventStore } from "./event-store.js";

// Transfer: baseline SLA adapter только декодирует signal и читает state.
// После основных этапов превратите наблюдение в независимую escalation command.
export const handleSlaSignal = (
  input: unknown,
): Effect.Effect<TicketState, InvalidRequest, EventStore> =>
  Effect.gen(function* () {
    const signal = yield* Schema.decodeUnknownEffect(SlaSignalSchema)(input).pipe(
      Effect.mapError(
        (cause) =>
          new InvalidRequest({
            message: "Request does not match the SLA signal contract",
            cause,
          }),
      ),
    );
    const store = yield* EventStore;
    const history = yield* store.load(signal.ticketId);
    return replay(history);
  });
