import { Effect, Layer } from "effect"
import type { Expense } from "../src/domain/expense.js"
import { ExpenseNotFound } from "../src/errors.js"
import { AppClock } from "../src/services/AppClock.js"
import {
  ExpenseRepository,
  type ExpenseRepositoryShape
} from "../src/services/ExpenseRepository.js"
import { IdGenerator } from "../src/services/IdGenerator.js"

export interface TestCalls {
  id: number
  clock: number
  save: number
}

export const makeHarness = (seed: ReadonlyArray<Expense> = []) => {
  const stored = new Map(seed.map((expense) => [expense.id, expense]))
  const calls: TestCalls = { id: 0, clock: 0, save: 0 }

  const repository: ExpenseRepositoryShape = {
    findById: (id) => {
      const expense = stored.get(id)
      return expense === undefined
        ? Effect.fail(new ExpenseNotFound({ id }))
        : Effect.succeed(expense)
    },
    save: (expense) =>
      Effect.sync(() => {
        calls.save += 1
        stored.set(expense.id, expense)
      }),
    list: () => Effect.sync(() => Array.from(stored.values()))
  }

  const layer = Layer.mergeAll(
    Layer.succeed(ExpenseRepository, repository),
    Layer.succeed(IdGenerator, {
      next: Effect.sync(() => {
        calls.id += 1
        return `expense-test-${calls.id}`
      })
    }),
    Layer.succeed(AppClock, {
      now: Effect.sync(() => {
        calls.clock += 1
        return `2026-07-26T10:00:0${calls.clock}.000Z`
      })
    })
  )

  return {
    calls,
    layer,
    snapshot: () => Array.from(stored.values())
  }
}

export const pendingExpense = (
  overrides: Partial<Expense> = {}
): Expense => ({
  id: "expense-pending",
  vendor: "Rail Europe",
  amountCents: 24_500,
  category: "travel",
  submittedBy: "alice",
  submittedAt: "2026-07-25T09:00:00.000Z",
  status: "Pending",
  approvedAt: null,
  approvedBy: null,
  ...overrides
})
