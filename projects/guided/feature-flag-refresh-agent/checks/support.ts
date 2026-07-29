import { Effect, Layer } from "effect";

import {
  GatewayUnavailable,
  SnapshotRejected,
} from "../src/errors.js";
import type { GatewayError } from "../src/errors.js";
import { makeFlagGatewayLayer } from "../src/flag-gateway.js";
import { FlagStoreLive } from "../src/flag-store.js";
import type { FlagSnapshot, FlagSource } from "../src/model.js";

export type GatewayStep =
  | {
      readonly _tag: "Success";
      readonly version: number;
      readonly delay?: `${number} millis`;
    }
  | {
      readonly _tag: "Unavailable";
      readonly status: number;
      readonly delay?: `${number} millis`;
    }
  | {
      readonly _tag: "Rejected";
      readonly reason: string;
      readonly delay?: `${number} millis`;
    }
  | {
      readonly _tag: "Hang";
    };

export interface GatewayHarnessOptions {
  readonly primary: ReadonlyArray<GatewayStep>;
  readonly replica?: ReadonlyArray<GatewayStep>;
}

export const makeGatewayHarness = (options: GatewayHarnessOptions) => {
  const queues: Record<FlagSource, Array<GatewayStep>> = {
    primary: [...options.primary],
    replica: [...(options.replica ?? [])],
  };
  const starts: Array<FlagSource> = [];
  const interrupts: Array<FlagSource> = [];
  let opened = 0;
  let closed = 0;

  const layer = makeFlagGatewayLayer(
    (source) =>
      Effect.suspend(() => {
        starts.push(source);
        const step = queues[source].shift() ?? {
          _tag: "Unavailable",
          status: 503,
        };

        let operation: Effect.Effect<FlagSnapshot, GatewayError>;
        if (step._tag === "Hang") {
          operation = Effect.never;
        } else if (step._tag === "Success") {
          operation = Effect.succeed({
            version: step.version,
            source,
            flags: { checkoutV2: step.version % 2 === 1 },
          });
        } else if (step._tag === "Rejected") {
          operation = Effect.fail(
            new SnapshotRejected({ source, reason: step.reason }),
          );
        } else {
          operation = Effect.fail(
            new GatewayUnavailable({ source, status: step.status }),
          );
        }

        return "delay" in step && step.delay !== undefined
          ? operation.pipe(Effect.delay(step.delay))
          : operation;
      }).pipe(
        Effect.onInterrupt(() =>
          Effect.sync(() => {
            interrupts.push(source);
          }),
        ),
      ),
    {
      onOpen: () => {
        opened += 1;
      },
      onClose: () => {
        closed += 1;
      },
    },
  );

  return {
    layer,
    appLayer: Layer.merge(layer, FlagStoreLive),
    snapshot: () => ({
      starts: [...starts],
      interrupts: [...interrupts],
      opened,
      closed,
    }),
  };
};
