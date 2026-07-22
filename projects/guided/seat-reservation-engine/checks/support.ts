import { Effect, Layer } from "effect";

import type { AidIdSchema, ReservationIdSchema, SeatId } from "../src/domain.js";
import {
  makeReservationRepositoryLayer,
  PaymentGateway,
  ReservationClock,
  ReservationIdGenerator,
  type PaymentGatewayService,
} from "../src/services.js";

export interface TestLayerOptions {
  readonly seats?: ReadonlyArray<SeatId>;
  readonly aids?: ReadonlyArray<AidIdSchema>;
  readonly now?: number;
  readonly ids?: ReadonlyArray<ReservationIdSchema>;
  readonly charge?: PaymentGatewayService["charge"];
}

export const makeTestLayer = (options: TestLayerOptions = {}) => {
  const ids = options.ids ?? ["reservation-1"];
  let index = 0;

  return Layer.mergeAll(
    makeReservationRepositoryLayer(
      options.seats ?? ["A1", "A2", "A3", "B1", "B2"],
      options.aids ?? ["hearing-1"],
    ),
    Layer.succeed(ReservationClock, {
      now: Effect.succeed(options.now ?? 1_000),
    }),
    Layer.succeed(ReservationIdGenerator, {
      next: Effect.sync(() => ids[index++] ?? `reservation-${index}`),
    }),
    Layer.succeed(PaymentGateway, {
      charge: options.charge ?? (() => Effect.void),
    }),
  );
};
