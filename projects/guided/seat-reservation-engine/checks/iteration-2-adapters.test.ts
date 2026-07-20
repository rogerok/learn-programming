import { it } from "@effect/vitest";
import { Effect, Either, Stream } from "effect";
import { describe, expect } from "vitest";

import type {
  BookingEvent,
  Reservation,
  VenueSnapshot,
} from "../src/domain.js";
import type { BookingOperationsService } from "../src/operations/application.js";
import { makeBookingOperationsLayer } from "../src/operations/application.js";
import { executeCliAction } from "../src/operations/cli.js";
import { makeOperationsWebHandler } from "../src/operations/http.js";

const snapshot: VenueSnapshot = {
  availableSeats: ["A1", "A2"],
  heldSeats: [],
  bookedSeats: [],
  availableAids: ["hearing-1"],
  reservations: [],
};

const heldReservation: Reservation = {
  id: "r-http",
  seats: ["A1"],
  aids: [],
  expiresAt: 10_000,
  status: "held",
};

const heldEvent: BookingEvent = {
  _tag: "ReservationHeld",
  reservation: heldReservation,
};

const service: BookingOperationsService = {
  status: Effect.succeed(snapshot),
  hold: () => Effect.succeed(heldReservation),
  confirm: () =>
    Effect.succeed({ ...heldReservation, status: "confirmed" as const }),
  cancel: () => Effect.void,
  events: Stream.make(heldEvent),
};

const applicationLayer = makeBookingOperationsLayer(service);

describe("Итерация 2 · Этап 4: CLI, HttpApi и SSE", () => {
  it.effect("CLI adapter направляет mutation в общий application port", () =>
    Effect.gen(function* () {
      const result = yield* executeCliAction({
        type: "hold",
        seats: ["A1"],
        durationMs: 5_000,
      }).pipe(Effect.provide(applicationLayer), Effect.either);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right).toMatchObject({ id: "r-http", seats: ["A1"] });
      }
    }),
  );

  it.effect("HTTP status и hold используют тот же application port", () =>
    Effect.acquireUseRelease(
      Effect.sync(() => makeOperationsWebHandler(applicationLayer)),
      (web) =>
        Effect.gen(function* () {
          const statusResponse = yield* Effect.promise(() =>
            web.handler(new Request("http://seat-engine.test/status")),
          );
          expect(statusResponse.status).toBe(200);
          expect(yield* Effect.promise(() => statusResponse.json())).toMatchObject(
            { availableSeats: ["A1", "A2"] },
          );

          const holdResponse = yield* Effect.promise(() =>
            web.handler(
              new Request("http://seat-engine.test/reservations", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ seats: ["A1"], durationMs: 5_000 }),
              }),
            ),
          );
          expect(holdResponse.status).toBe(200);
          expect(yield* Effect.promise(() => holdResponse.json())).toMatchObject({
            id: "r-http",
            seats: ["A1"],
          });
        }),
      (web) => Effect.promise(() => web.dispose()),
    ),
  );

  it.effect("SSE endpoint кодирует booking event и завершает finite source", () =>
    Effect.acquireUseRelease(
      Effect.sync(() => makeOperationsWebHandler(applicationLayer)),
      (web) =>
        Effect.gen(function* () {
          const response = yield* Effect.promise(() =>
            web.handler(new Request("http://seat-engine.test/events")),
          );
          expect(response.status).toBe(200);
          expect(response.headers.get("content-type")).toContain(
            "text/event-stream",
          );

          const body = yield* Effect.promise(() => response.text());
          expect(body).toContain("event: ReservationHeld");
          expect(body).toContain('"id":"r-http"');
        }),
      (web) => Effect.promise(() => web.dispose()),
    ),
  );
});
