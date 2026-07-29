import { Effect } from "effect";
import { TestClock } from "effect/testing";
import { describe, expect, it } from "vitest";

import { executeTicketCommand } from "../src/application.js";
import { agentId, makeTrackingStore, ticketId } from "./support.js";

describe("milestone 2: application orchestration", () => {
  it("loads, replays, decides and appends across independent commands", async () => {
    const store = makeTrackingStore();
    const program = Effect.gen(function* () {
      yield* TestClock.setTime(100);
      const openState = yield* executeTicketCommand({
        _tag: "OpenTicket",
        ticketId,
        title: "Сбой авторизации",
      });

      yield* TestClock.setTime(200);
      const assignedState = yield* executeTicketCommand({
        _tag: "AssignTicket",
        ticketId,
        agentId,
      });

      yield* TestClock.setTime(300);
      const resolvedState = yield* executeTicketCommand({
        _tag: "ResolveTicket",
        ticketId,
        resolution: "Доступ восстановлен",
      });

      return { openState, assignedState, resolvedState };
    }).pipe(
      Effect.provide(store.layer),
      Effect.provide(TestClock.layer()),
    );

    const states = await Effect.runPromise(program);

    expect(states.openState._tag).toBe("Open");
    expect(states.assignedState._tag).toBe("Assigned");
    expect(states.resolvedState._tag).toBe("Resolved");
    expect(store.loadCount()).toBe(3);
    expect(store.eventsFor(ticketId).map((event) => event._tag)).toEqual([
      "TicketOpened",
      "TicketAssigned",
      "TicketResolved",
    ]);
  });

  it("does not append when decide rejects a command", async () => {
    const store = makeTrackingStore();
    const program = Effect.gen(function* () {
      yield* executeTicketCommand({
        _tag: "OpenTicket",
        ticketId,
        title: "Сбой авторизации",
      });

      return yield* executeTicketCommand({
        _tag: "ResolveTicket",
        ticketId,
        resolution: "Неверный переход",
      }).pipe(
        Effect.catchTag("InvalidTransition", (error) =>
          Effect.succeed(error),
        ),
      );
    }).pipe(Effect.provide(store.layer));

    const result = await Effect.runPromise(program);

    expect(result).toMatchObject({
      _tag: "InvalidTransition",
      from: "Open",
    });
    expect(store.appendCount()).toBe(1);
    expect(store.eventsFor(ticketId)).toHaveLength(1);
  });
});
