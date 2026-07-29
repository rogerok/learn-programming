import { Effect } from "effect"
import { submitExpense } from "./application/submitExpense.js"
import type { InvalidExpenseInput } from "./errors.js"
import type { AppClock } from "./services/AppClock.js"
import type { ExpenseRepository } from "./services/ExpenseRepository.js"
import type { IdGenerator } from "./services/IdGenerator.js"

export interface ImportedItem {
  readonly index: number
  readonly _tag: "Imported"
  readonly id: string
}

export interface RejectedItem {
  readonly index: number
  readonly _tag: "Rejected"
  readonly reason: string
}

export interface ImportSummary {
  readonly results: ReadonlyArray<ImportedItem | RejectedItem>
}

export const importExpenses = (
  input: unknown
): Effect.Effect<
  ImportSummary,
  InvalidExpenseInput,
  ExpenseRepository | IdGenerator | AppClock
> =>
  Effect.gen(function* () {
    // Transfer baseline обрабатывает только полностью корректный trusted batch.
    const drafts = input as ReadonlyArray<unknown>
    const expenses = yield* Effect.forEach(drafts, submitExpense)

    return {
      results: expenses.map((expense, index) => ({
        index,
        _tag: "Imported" as const,
        id: expense.id
      }))
    }
  })
