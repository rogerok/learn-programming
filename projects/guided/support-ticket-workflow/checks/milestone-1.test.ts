import { Effect } from "effect";
import { TestClock } from "effect/testing";
import { describe, expect, it } from "vitest";

import { decide, replay } from "../src/decider.js";
import type { TicketEvent, TicketState } from "../src/domain.js";
import { agentId, ticketId } from "./support.js";

const opened: TicketState = {
  _tag: "Open",
  ticketId,
  title: "Сбой авторизации",
  openedAt: 100,
};

const assigned: TicketState = {
  _tag: "Assigned",
  ticketId,
  title: "Сбой авторизации",
  openedAt: 100,
  agentId,
  assignedAt: 200,
};

describe("milestone 1: Decider", () => {
  it("replays the complete event history into Resolved state", () => {
    const events: ReadonlyArray<TicketEvent> = [
      {
        _tag: "TicketOpened",
        ticketId,
        title: "Сбой авторизации",
        occurredAt: 100,
      },
      { _tag: "TicketAssigned", ticketId, agentId, occurredAt: 200 },
      {
        _tag: "TicketResolved",
        ticketId,
        resolution: "Сессия отозвана",
        occurredAt: 300,
      },
    ];

    expect(replay(events)).toEqual({
      _tag: "Resolved",
      ticketId,
      title: "Сбой авторизации",
      agentId,
      resolution: "Сессия отозвана",
      resolvedAt: 300,
    });
  });

  it("emits TicketAssigned with time from Effect Clock", async () => {
    const stateBefore = Object.freeze({ ...opened });
    const program = Effect.gen(function* () {
      yield* TestClock.setTime(1_234);
      return yield* decide(stateBefore, {
        _tag: "AssignTicket",
        ticketId,
        agentId,
      });
    }).pipe(Effect.provide(TestClock.layer()));

    const events = await Effect.runPromise(program);

    expect(events).toEqual([
      { _tag: "TicketAssigned", ticketId, agentId, occurredAt: 1_234 },
    ]);
    expect(stateBefore).toEqual(opened);
  });

  it("emits TicketResolved only from Assigned", async () => {
    const events = await Effect.runPromise(
      decide(assigned, {
        _tag: "ResolveTicket",
        ticketId,
        resolution: "Доступ восстановлен",
      }),
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      _tag: "TicketResolved",
      resolution: "Доступ восстановлен",
    });

    await expect(
      Effect.runPromise(
        decide(opened, {
          _tag: "ResolveTicket",
          ticketId,
          resolution: "Нельзя пропустить назначение",
        }),
      ),
    ).rejects.toMatchObject({
      _tag: "InvalidTransition",
      command: "ResolveTicket",
      from: "Open",
    });
  });
});
