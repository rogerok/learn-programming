import { Context, Effect, Layer } from "effect"
import { randomUUID } from "node:crypto"

export interface IdGeneratorShape {
  readonly next: Effect.Effect<string>
}

export class IdGenerator extends Context.Service<
  IdGenerator,
  IdGeneratorShape
>()("ExpenseApproval/IdGenerator") {}

export const IdGeneratorLive = Layer.succeed(IdGenerator, {
  next: Effect.sync(() => `expense-${randomUUID()}`)
})
