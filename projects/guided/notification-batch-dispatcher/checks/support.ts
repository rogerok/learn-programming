import { Effect, Layer } from "effect";

import {
  BatchRejected,
  GatewayUnavailable,
  batchKeyOf,
  type GatewayReceipt,
  type Notification,
} from "../src/domain.js";
import { BatchGateway } from "../src/services.js";

export type GatewayStep = "success" | "unavailable" | "rejected";

export interface GatewaySnapshot {
  readonly active: number;
  readonly maxActive: number;
  readonly calls: ReadonlyArray<ReadonlyArray<string>>;
  readonly attemptsByBatch: Readonly<Record<string, number>>;
}

export const makeNotifications = (count: number): ReadonlyArray<Notification> =>
  Array.from({ length: count }, (_, index) => ({
    id: `n${index + 1}`,
    recipient: `recipient-${(index % 3) + 1}`,
    message: `message-${index + 1}`,
  }));

export const makeGatewayHarness = (options?: {
  readonly delayMillis?: number;
  readonly scripts?: Readonly<Record<string, ReadonlyArray<GatewayStep>>>;
}) => {
  let active = 0;
  let maxActive = 0;
  const calls: Array<ReadonlyArray<string>> = [];
  const attempts = new Map<string, number>();

  const service = {
    sendBatch: (batch: ReadonlyArray<Notification>) => {
      const key = batchKeyOf(batch);
      const attempt = (attempts.get(key) ?? 0) + 1;
      attempts.set(key, attempt);
      const script = options?.scripts?.[key];
      const step = script?.[attempt - 1] ?? script?.at(-1) ?? "success";

      const operation = Effect.gen(function* () {
        active += 1;
        maxActive = Math.max(maxActive, active);
        calls.push(batch.map(({ id }) => id));

        if ((options?.delayMillis ?? 0) > 0) {
          yield* Effect.sleep(`${options?.delayMillis ?? 0} millis`);
        }

        if (step === "unavailable") {
          return yield* Effect.fail(new GatewayUnavailable({ batchKey: key }));
        }
        if (step === "rejected") {
          return yield* Effect.fail(
            new BatchRejected({ batchKey: key, reason: "invalid recipient" }),
          );
        }

        return {
          gatewayBatchId: `gateway-${key}-${attempt}`,
          acceptedIds: batch.map(({ id }) => id),
        } satisfies GatewayReceipt;
      });

      return operation.pipe(
        Effect.ensuring(
          Effect.sync(() => {
            active -= 1;
          }),
        ),
      );
    },
  };

  return {
    layer: Layer.succeed(BatchGateway, service),
    snapshot: (): GatewaySnapshot => ({
      active,
      maxActive,
      calls: calls.map((call) => [...call]),
      attemptsByBatch: Object.fromEntries(attempts),
    }),
  };
};
