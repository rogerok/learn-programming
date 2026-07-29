import { ManagedRuntime } from "effect";
import type { Effect, Layer } from "effect";

import type { FlagGateway } from "./flag-gateway.js";
import type { FlagStore } from "./flag-store.js";

type AppServices = FlagGateway | FlagStore;

/**
 * Baseline даёт каждому callback отдельный корректно закрываемый runtime.
 * Этап 4 переносит ownership runtime на весь жизненный цикл host.
 */
export const runWithFreshRuntime = async <A, E>(
  layer: Layer.Layer<AppServices, never, never>,
  program: Effect.Effect<A, E, AppServices>,
): Promise<A> => {
  const runtime = ManagedRuntime.make(layer);
  try {
    return await runtime.runPromise(program);
  } finally {
    await runtime.dispose();
  }
};
