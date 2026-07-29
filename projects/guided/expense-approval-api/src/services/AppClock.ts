import { Context, Effect, Layer } from "effect"

export interface AppClockShape {
  readonly now: Effect.Effect<string>
}

export class AppClock extends Context.Service<AppClock, AppClockShape>()(
  "ExpenseApproval/AppClock"
) {}

export const AppClockLive = Layer.succeed(AppClock, {
  now: Effect.sync(() => new Date().toISOString())
})
