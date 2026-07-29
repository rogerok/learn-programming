import { Effect } from "effect";

import type { Decider } from "./decider.js";

export interface ScenarioResult<State, Event> {
  readonly state: State;
  readonly history: ReadonlyArray<Event>;
}

export const runScenario = <Command, State, Event, Error, Requirements>(
  decider: Decider<Command, State, Event, Error, Requirements>,
  commands: ReadonlyArray<Command>,
): Effect.Effect<ScenarioResult<State, Event>, Error, Requirements> =>
  Effect.gen(function* () {
    let state = decider.initial;
    const history: Array<Event> = [];

    for (const command of commands) {
      const events = yield* decider.decide(state, command);
      history.push(...events);

      // Этап 2: baseline-команды выпускают по одному event, поэтому сейчас
      // достаточно первого. Finance policy этапа 1 сделает это допущение видимым.
      const first = events[0];
      if (first !== undefined) {
        state = decider.evolve(state, first);
      }
    }

    return { state, history };
  });
