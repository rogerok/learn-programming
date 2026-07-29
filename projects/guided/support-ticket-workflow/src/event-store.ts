import { Context, Effect, Layer } from "effect";

import type { TicketEvent, TicketId } from "./domain.js";

export interface EventStoreShape {
  readonly load: (
    ticketId: TicketId,
  ) => Effect.Effect<ReadonlyArray<TicketEvent>>;
  readonly append: (
    ticketId: TicketId,
    events: ReadonlyArray<TicketEvent>,
  ) => Effect.Effect<void>;
}

export class EventStore extends Context.Service<EventStore, EventStoreShape>()(
  "guided-support-ticket-workflow/EventStore",
) {}

export const makeMemoryEventStore = (): EventStoreShape => {
  const streams = new Map<TicketId, ReadonlyArray<TicketEvent>>();

  return {
    load: (ticketId) =>
      Effect.sync(() => [...(streams.get(ticketId) ?? [])]),
    append: (ticketId, events) =>
      Effect.sync(() => {
        const current = streams.get(ticketId) ?? [];
        streams.set(ticketId, [...current, ...events]);
      }),
  };
};

export const EventStoreMemory = Layer.sync(
  EventStore,
  makeMemoryEventStore,
);
