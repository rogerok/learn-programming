import type { Layer } from "effect";

import { AppLive } from "./app-layer.js";
import { HostStopped } from "./errors.js";
import type { FlagGateway } from "./flag-gateway.js";
import { readFlagState } from "./flag-store.js";
import type { FlagStore } from "./flag-store.js";
import type { RefreshObservation, RefreshState } from "./model.js";
import { refreshOnce } from "./refresh-loop.js";
import { runWithFreshRuntime } from "./runtime.js";

export interface RefreshHost {
  readonly refreshNow: () => Promise<RefreshObservation>;
  readonly readStatus: () => Promise<RefreshState>;
  readonly stop: () => Promise<void>;
}

/**
 * Baseline корректно изолирует каждый callback, но не сохраняет Layer между ними.
 * Этап 4 переносит один ManagedRuntime внутрь createHost.
 */
export const createHost = (
  layer: Layer.Layer<FlagGateway | FlagStore, never, never> = AppLive,
): RefreshHost => {
  let stopped = false;

  return {
    refreshNow: () =>
      stopped
        ? Promise.reject(new HostStopped({ operation: "host-callback" }))
        : runWithFreshRuntime(layer, refreshOnce),
    readStatus: () =>
      stopped
        ? Promise.reject(new HostStopped({ operation: "host-callback" }))
        : runWithFreshRuntime(layer, readFlagState),
    stop: async () => {
      stopped = true;
    },
  };
};
