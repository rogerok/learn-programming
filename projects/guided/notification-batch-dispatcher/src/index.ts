import { Effect, Layer } from "effect";

import type { Notification } from "./domain.js";
import { runDispatcher } from "./pipeline.js";
import {
  BatchGatewayDemo,
  makeNotificationSourceLayer,
} from "./services.js";

const notifications: ReadonlyArray<Notification> = Array.from(
  { length: 7 },
  (_, index) => ({
    id: `notification-${index + 1}`,
    recipient: `user-${(index % 3) + 1}`,
    message: `Message ${index + 1}`,
  }),
);

const MainLayer = Layer.mergeAll(
  makeNotificationSourceLayer(notifications),
  BatchGatewayDemo,
);

const program = runDispatcher.pipe(
  Effect.provide(MainLayer),
  Effect.tap((outcomes) =>
    Effect.log(
      `dispatcher completed: ${outcomes.length} outcomes for ${notifications.length} notifications`,
    ),
  ),
);

Effect.runPromise(program).catch((cause: unknown) => {
  console.error(cause);
  process.exitCode = 1;
});
