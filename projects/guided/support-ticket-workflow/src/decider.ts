import { Clock, Effect } from "effect";

import {
  InvalidTransition,
  type TicketDecisionCommand,
  type TicketEvent,
  type TicketState,
} from "./domain.js";

export const initial: TicketState = { _tag: "NotOpened" };

// Этап 1: starter материализует только TicketOpened. Остальные события уже
// находятся в публичном contract; добавьте их по таблице переходов из GUIDE.md.
export const evolve = (
  state: TicketState,
  event: TicketEvent,
): TicketState => {
  if (event._tag === "TicketOpened") {
    return {
      _tag: "Open",
      ticketId: event.ticketId,
      title: event.title,
      openedAt: event.occurredAt,
    };
  }

  return state;
};

export const replay = (events: ReadonlyArray<TicketEvent>): TicketState =>
  events.reduce(evolve, initial);

// Этап 1: starter policy разрешает только первый переход OpenTicket.
export const decide = (
  state: TicketState,
  command: TicketDecisionCommand,
): Effect.Effect<ReadonlyArray<TicketEvent>, InvalidTransition> =>
  Effect.gen(function* () {
    if (command._tag === "OpenTicket" && state._tag === "NotOpened") {
      const occurredAt = yield* Clock.currentTimeMillis;
      return [
        {
          _tag: "TicketOpened" as const,
          ticketId: command.ticketId,
          title: command.title,
          occurredAt,
        },
      ];
    }

    return yield* Effect.fail(
      new InvalidTransition({
        command: command._tag,
        from: state._tag,
      }),
    );
  });
