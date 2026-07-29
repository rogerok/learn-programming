import { Effect } from "effect";

import { demoCarrierGateway } from "./carrier.js";
import { executeScanAction, printReport } from "./cli.js";
import { defaultScanOptions } from "./pipeline.js";

const rawArgs = process.argv.slice(2);
const positionalArgs = rawArgs[0] === "scan" ? rawArgs.slice(1) : rawArgs;
const trackingIds =
  positionalArgs.length === 0
    ? ["PKG-101", "PKG-102", "PKG-101"]
    : positionalArgs;

/**
 * Этап 4: это рабочий ручной argv adapter. Он намеренно не разбирает options и
 * не управляет lifecycle; GUIDE заменяет только эту boundary на @effect/cli.
 */
const program = executeScanAction(demoCarrierGateway, {
  trackingIds,
  concurrency: defaultScanOptions.concurrency,
  batchSize: defaultScanOptions.batchSize,
  maxRetries: defaultScanOptions.resilience.maxRetries,
}).pipe(Effect.flatMap(printReport));

void Effect.runPromise(program).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
