import { Duration, Effect, Scope, Stream } from "effect";

import type { BookingEvent } from "../domain.js";

export interface EventBatchOptions {
  readonly maxBatchSize: number;
  readonly within: Duration.DurationInput;
}

export interface SharedEventOptions {
  readonly capacity: number;
  readonly replay: number;
  readonly idleTimeToLive: Duration.DurationInput;
}

/**
 * The starter audit path flushes each event immediately. Iteration 2 replaces
 * this valid low-latency baseline with bounded size-or-time batches.
 */
export const batchBookingEvents = (
  source: Stream.Stream<BookingEvent>,
  options: EventBatchOptions,
): Stream.Stream<ReadonlyArray<BookingEvent>> => {
  void options;
  return source.pipe(Stream.map((event) => [event]));
};

/**
 * The starter returns the cold source unchanged. Iteration 2 turns it into one
 * scoped, reference-counted upstream shared by concurrent consumers.
 */
export const shareBookingEvents = (
  source: Stream.Stream<BookingEvent>,
  options: SharedEventOptions,
): Effect.Effect<Stream.Stream<BookingEvent>, never, Scope.Scope> => {
  void options;
  return Effect.succeed(source);
};
