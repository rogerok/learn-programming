import { Stream } from "effect";

import type { BatchOutcome, Notification, SourceError } from "./domain.js";
import { sendBatchWithPolicy } from "./pipeline.js";
import type { BatchGateway } from "./services.js";

/**
 * Transfer: baseline знает только фиксированный размер и поэтому не выпускает
 * неполный batch, пока бесконечный low-traffic source остаётся открытым.
 */
export const dispatchWithin = (
  source: Stream.Stream<Notification, SourceError>,
): Stream.Stream<BatchOutcome, SourceError, BatchGateway> =>
  source.pipe(
    Stream.grouped(3),
    Stream.mapEffect(sendBatchWithPolicy, { concurrency: 2 }),
  );
