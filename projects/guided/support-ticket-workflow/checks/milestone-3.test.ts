import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";

import { EventStore } from "../src/event-store.js";
import { handleTicketRequest } from "../src/transport.js";
import { agentId, makeTrackingStore, ticketId } from "./support.js";

describe("milestone 3: request boundary", () => {
  it("accepts the complete user-command lifecycle through unknown input", async () => {
    const store = makeTrackingStore();
    const program = Effect.gen(function* () {
      const opened = yield* handleTicketRequest({
        _tag: "OpenTicket",
        ticketId,
        title: "Сбой авторизации",
      });
      const assigned = yield* handleTicketRequest({
        _tag: "AssignTicket",
        ticketId,
        agentId,
      });
      const resolved = yield* handleTicketRequest({
        _tag: "ResolveTicket",
        ticketId,
        resolution: "Доступ восстановлен",
      });
      return { opened, assigned, resolved };
    }).pipe(Effect.provide(store.layer));

    const responses = await Effect.runPromise(program);

    expect(responses.opened.status).toBe("accepted");
    expect(responses.assigned).toMatchObject({
      status: "accepted",
      state: { _tag: "Assigned" },
    });
    expect(responses.resolved).toMatchObject({
      status: "accepted",
      state: { _tag: "Resolved" },
    });
  });

  it("maps an invalid transition to conflict without adding an event", async () => {
    const store = makeTrackingStore();
    const program = Effect.gen(function* () {
      yield* handleTicketRequest({
        _tag: "OpenTicket",
        ticketId,
        title: "Сбой авторизации",
      });
      return yield* handleTicketRequest({
        _tag: "ResolveTicket",
        ticketId,
        resolution: "Пропускаем назначение",
      });
    }).pipe(Effect.provide(store.layer));

    const response = await Effect.runPromise(program);

    expect(response).toEqual({
      status: "conflict",
      command: "ResolveTicket",
      from: "Open",
    });
    expect(store.eventsFor(ticketId)).toHaveLength(1);
  });

  it("does not turn an EventStore defect into a domain response", async () => {
    const failingStore = Layer.succeed(EventStore, {
      load: () => Effect.die(new Error("storage defect")),
      append: () => Effect.void,
    });

    await expect(
      Effect.runPromise(
        handleTicketRequest({
          _tag: "OpenTicket",
          ticketId,
          title: "Сбой авторизации",
        }).pipe(Effect.provide(failingStore)),
      ),
    ).rejects.toThrow(/storage defect/);
  });
});
