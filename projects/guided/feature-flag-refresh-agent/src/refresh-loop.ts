import { Effect, Schedule } from "effect";

import type { FlagGateway } from "./flag-gateway.js";
import { FlagStore } from "./flag-store.js";
import { fetchFlags } from "./fetch-flags.js";
import type { RefreshObservation } from "./model.js";

export const refreshOnce: Effect.Effect<
  RefreshObservation,
  never,
  FlagStore | FlagGateway
> = fetchFlags.pipe(
  Effect.match({
    onFailure: (error) =>
      ({ _tag: "Unavailable", error }) satisfies RefreshObservation,
    onSuccess: (snapshot) =>
      ({ _tag: "Updated", snapshot }) satisfies RefreshObservation,
  }),
  Effect.tap((observation) =>
    Effect.gen(function* () {
      const store = yield* FlagStore;
      yield* store.record(observation);
    }),
  ),
);

/**
 * Baseline выполняет один рабочий раунд через конечный schedule.
 * Этап 3 меняет только политику повторения, сохраняя refreshOnce.
 */
export const refreshLoop = refreshOnce.pipe(
  Effect.repeat(Schedule.recurs(0)),
);
