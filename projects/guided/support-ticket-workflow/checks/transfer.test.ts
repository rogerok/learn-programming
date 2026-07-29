import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { executeTicketCommand } from "../src/application.js";
import { handleSlaSignal } from "../src/sla.js";
import { agentId, makeTrackingStore, secondTicketId, ticketId } from "./support.js";

describe("independent transfer: SLA signal", () => {
  it("escalates an open ticket once using observedAt", async () => {
    const store = makeTrackingStore();
    const program = Effect.gen(function* () {
      yield* executeTicketCommand({
        _tag: "OpenTicket",
        ticketId,
        title: "Истекает SLA",
      });
      const first = yield* handleSlaSignal({ ticketId, observedAt: 5_000 });
      const second = yield* handleSlaSignal({ ticketId, observedAt: 6_000 });
      return { first, second };
    }).pipe(Effect.provide(store.layer));

    const states = await Effect.runPromise(program);

    expect(states.first).toMatchObject({
      _tag: "Escalated",
      ticketId,
      agentId: null,
      escalatedAt: 5_000,
    });
    expect(states.second).toEqual(states.first);
    expect(store.eventsFor(ticketId).map((event) => event._tag)).toEqual([
      "TicketOpened",
      "TicketEscalated",
    ]);
    expect(store.eventsFor(ticketId)[1]).toMatchObject({ occurredAt: 5_000 });
  });

  it("leaves a resolved ticket unchanged", async () => {
    const store = makeTrackingStore();
    const program = Effect.gen(function* () {
      yield* executeTicketCommand({
        _tag: "OpenTicket",
        ticketId: secondTicketId,
        title: "Уже решено",
      });
      yield* executeTicketCommand({
        _tag: "AssignTicket",
        ticketId: secondTicketId,
        agentId,
      });
      yield* executeTicketCommand({
        _tag: "ResolveTicket",
        ticketId: secondTicketId,
        resolution: "Исправлено",
      });
      return yield* handleSlaSignal({
        ticketId: secondTicketId,
        observedAt: 9_000,
      });
    }).pipe(Effect.provide(store.layer));

    const state = await Effect.runPromise(program);

    expect(state._tag).toBe("Resolved");
    expect(store.eventsFor(secondTicketId).map((event) => event._tag)).toEqual([
      "TicketOpened",
      "TicketAssigned",
      "TicketResolved",
    ]);
  });
});
