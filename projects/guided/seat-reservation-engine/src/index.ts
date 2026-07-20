import { Console, Effect, Layer } from "effect";

import { listVenue } from "./booking.js";
import {
  makeReservationRepositoryLayer,
  SupportServicesLive,
} from "./services.js";

const VenueLive = makeReservationRepositoryLayer(
  ["A1", "A2", "A3", "B1", "B2", "B3"],
  ["hearing-1"],
);

const AppLive = Layer.merge(VenueLive, SupportServicesLive);

const program = Effect.gen(function* () {
  const snapshot = yield* listVenue;
  yield* Console.log("Seat Reservation Engine — starter");
  yield* Console.log(`Available seats: ${snapshot.availableSeats.join(", ")}`);
  yield* Console.log(`Available accessibility aids: ${snapshot.availableAids.join(", ")}`);
});

Effect.runPromise(program.pipe(Effect.provide(AppLive))).catch((cause: unknown) => {
  console.error(cause);
  process.exitCode = 1;
});
