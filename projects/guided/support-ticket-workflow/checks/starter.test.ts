import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { handleTicketRequest } from "../src/transport.js";
import { makeTrackingStore, ticketId } from "./support.js";

describe("working starter slice", () => {
  it("opens one valid ticket through the public request boundary", async () => {
    const store = makeTrackingStore();
    const response = await Effect.runPromise(
      handleTicketRequest({
        _tag: "OpenTicket",
        ticketId,
        title: "Не приходит письмо",
      }).pipe(Effect.provide(store.layer)),
    );

    expect(response.status).toBe("accepted");
    expect(response.status === "accepted" && response.state._tag).toBe("Open");
    expect(store.eventsFor(ticketId).map((event) => event._tag)).toEqual([
      "TicketOpened",
    ]);
  });

  it("rejects malformed input before touching EventStore", async () => {
    const store = makeTrackingStore();
    const response = await Effect.runPromise(
      handleTicketRequest({
        _tag: "OpenTicket",
        ticketId: "wrong-id",
        title: "",
      }).pipe(Effect.provide(store.layer)),
    );

    expect(response.status).toBe("invalid-request");
    expect(store.loadCount()).toBe(0);
    expect(store.appendCount()).toBe(0);
  });
});
