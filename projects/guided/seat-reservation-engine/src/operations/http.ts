import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpServer,
} from "@effect/platform";
import { Effect, Layer, Schema } from "effect";

import {
  BookingOperations,
  type BookingOperationsService,
} from "./application.js";

const VenueStatus = Schema.Struct({
  availableSeats: Schema.Array(Schema.String),
  heldSeats: Schema.Array(Schema.String),
  bookedSeats: Schema.Array(Schema.String),
});

const statusGroup = HttpApiGroup.make("status").add(
  HttpApiEndpoint.get("snapshot", "/status").addSuccess(VenueStatus),
);

/**
 * The starter API is deliberately read-only. Iteration 2 adds mutation routes
 * and a scoped SSE event feed while preserving this status contract.
 */
export const SeatReservationApi = HttpApi.make("seatReservation").add(
  statusGroup,
);

const StatusHandlersLive = HttpApiBuilder.group(
  SeatReservationApi,
  "status",
  (handlers) =>
    handlers.handle("snapshot", () =>
      Effect.gen(function* () {
        const operations = yield* BookingOperations;
        const snapshot = yield* operations.status;
        return {
          availableSeats: snapshot.availableSeats,
          heldSeats: snapshot.heldSeats,
          bookedSeats: snapshot.bookedSeats,
        };
      }),
    ),
);

export const SeatReservationApiLive = HttpApiBuilder.api(
  SeatReservationApi,
).pipe(Layer.provide(StatusHandlersLive));

export const makeOperationsWebHandler = (
  operationsLayer: Layer.Layer<BookingOperationsService>,
) =>
  HttpApiBuilder.toWebHandler(
    SeatReservationApiLive.pipe(
      Layer.provide(operationsLayer),
      Layer.provideMerge(HttpServer.layerContext),
    ),
  );
