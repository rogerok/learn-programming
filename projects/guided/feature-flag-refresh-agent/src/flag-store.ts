import { Effect, Layer, Ref } from "effect";

import type { RefreshObservation, RefreshState } from "./model.js";

export interface FlagStoreShape {
  readonly read: Effect.Effect<RefreshState>;
  readonly record: (observation: RefreshObservation) => Effect.Effect<void>;
}

export class FlagStore extends Effect.Tag(
  "guided-feature-flag-refresh-agent/FlagStore",
)<FlagStore, FlagStoreShape>() {}

const initialState: RefreshState = {
  lastGood: null,
  lastObservation: null,
};

export const FlagStoreLive = Layer.effect(
  FlagStore,
  Ref.make(initialState).pipe(
    Effect.map((state) => ({
      read: Ref.get(state),
      record: (observation: RefreshObservation) =>
        Ref.update(state, (current) => ({
          lastGood:
            observation._tag === "Updated"
              ? observation.snapshot
              : current.lastGood,
          lastObservation: observation,
        })),
    })),
  ),
);

export const readFlagState = Effect.gen(function* () {
  const store = yield* FlagStore;
  return yield* store.read;
});
