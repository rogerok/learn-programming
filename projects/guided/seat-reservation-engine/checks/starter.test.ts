import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { listVenue } from "../src/booking.js";
import { makeTestLayer } from "./support.js";

describe("starter: работающая схема зала", () => {
  it("показывает доступные места и оборудование без изменения состояния", async () => {
    const snapshot = await Effect.runPromise(
      listVenue.pipe(
        Effect.provide(
          makeTestLayer({
            seats: ["A1", "A2", "B1"],
            aids: ["hearing-1"],
          }),
        ),
      ),
    );

    expect(snapshot).toMatchObject({
      availableSeats: ["A1", "A2", "B1"],
      heldSeats: [],
      bookedSeats: [],
      availableAids: ["hearing-1"],
      reservations: [],
    });
  });
});
