import { Effect, Layer } from "effect";

import { GatewayUnavailable } from "./errors.js";
import type { GatewayError } from "./errors.js";
import type { FlagSnapshot, FlagSource } from "./model.js";

export interface FlagGatewayShape {
  readonly load: (
    source: FlagSource,
  ) => Effect.Effect<FlagSnapshot, GatewayError>;
}

export class FlagGateway extends Effect.Tag(
  "guided-feature-flag-refresh-agent/FlagGateway",
)<FlagGateway, FlagGatewayShape>() {}

export interface GatewayLifecycleHooks {
  readonly onOpen?: () => void;
  readonly onClose?: () => void;
}

export const makeFlagGatewayLayer = (
  load: FlagGatewayShape["load"],
  hooks: GatewayLifecycleHooks = {},
) =>
  Layer.scoped(
    FlagGateway,
    Effect.acquireRelease(
      Effect.sync(() => {
        hooks.onOpen?.();
        return { load } satisfies FlagGatewayShape;
      }),
      () => Effect.sync(() => hooks.onClose?.()),
    ),
  );

export const FlagGatewayDemo = makeFlagGatewayLayer((source) =>
  Effect.gen(function* () {
    yield* Effect.sleep(source === "primary" ? "15 millis" : "5 millis");
    if (source === "replica") {
      return yield* Effect.fail(
        new GatewayUnavailable({ source, status: 503 }),
      );
    }
    return {
      version: 1,
      source,
      flags: {
        checkoutV2: true,
        compactHeader: false,
      },
    } satisfies FlagSnapshot;
  }),
);
