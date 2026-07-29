import { Effect, Layer, Schema } from "effect";

import {
  AgentId,
  TicketId,
  type TicketEvent,
} from "../src/domain.js";
import {
  EventStore,
  type EventStoreShape,
} from "../src/event-store.js";

export const ticketId = Schema.decodeUnknownSync(TicketId)("ticket_test1");
export const secondTicketId = Schema.decodeUnknownSync(TicketId)("ticket_test2");
export const agentId = Schema.decodeUnknownSync(AgentId)("agent_007");

export interface TrackingStore {
  readonly service: EventStoreShape;
  readonly layer: Layer.Layer<EventStore>;
  readonly eventsFor: (id: TicketId) => ReadonlyArray<TicketEvent>;
  readonly loadCount: () => number;
  readonly appendCount: () => number;
}

export const makeTrackingStore = (): TrackingStore => {
  const streams = new Map<TicketId, ReadonlyArray<TicketEvent>>();
  let loads = 0;
  let appends = 0;

  const service: EventStoreShape = {
    load: (id) =>
      Effect.sync(() => {
        loads += 1;
        return [...(streams.get(id) ?? [])];
      }),
    append: (id, events) =>
      Effect.sync(() => {
        appends += 1;
        streams.set(id, [...(streams.get(id) ?? []), ...events]);
      }),
  };

  return {
    service,
    layer: Layer.succeed(EventStore, service),
    eventsFor: (id) => [...(streams.get(id) ?? [])],
    loadCount: () => loads,
    appendCount: () => appends,
  };
};
