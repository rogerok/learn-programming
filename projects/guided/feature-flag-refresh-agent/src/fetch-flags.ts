import { Effect } from "effect";

import { FlagGateway } from "./flag-gateway.js";

/**
 * Baseline читает только primary без временной политики.
 * Этап 2 добавляет hedged replica, per-attempt timeout, retry и общий deadline.
 */
export const fetchFlags = Effect.gen(function* () {
  const gateway = yield* FlagGateway;
  return yield* gateway.load("primary");
});
