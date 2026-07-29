import type { Effect } from "effect";

export interface Decider<Command, State, Event, Error, Requirements = never> {
  readonly initial: State;
  readonly decide: (
    state: State,
    command: Command,
  ) => Effect.Effect<ReadonlyArray<Event>, Error, Requirements>;
  readonly evolve: (state: State, event: Event) => State;
}

export const replay = <Command, State, Event, Error, Requirements>(
  decider: Decider<Command, State, Event, Error, Requirements>,
  history: ReadonlyArray<Event>,
): State => history.reduce(decider.evolve, decider.initial);
