import { Effect } from "effect";

import { decide, initial, replay } from "./decider.js";
import {
  ticketIdOf,
  type InvalidTransition,
  type TicketDecisionCommand,
  type TicketState,
} from "./domain.js";
import { EventStore } from "./event-store.js";

// Этап 2: starter корректно проводит первую команду, но решает каждую команду
// от initial. Добавьте load → replay перед decide и верните полное новое state.
export const executeTicketCommand = (
  command: TicketDecisionCommand,
): Effect.Effect<TicketState, InvalidTransition, EventStore> =>
  Effect.gen(function* () {
    const store = yield* EventStore;
    const events = yield* decide(initial, command);
    yield* store.append(ticketIdOf(command), events);
    return replay(events);
  });
