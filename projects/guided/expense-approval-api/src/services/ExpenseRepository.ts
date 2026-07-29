import { Context, Effect, Layer } from "effect"
import type { Expense } from "../domain/expense.js"
import { ExpenseNotFound } from "../errors.js"

export interface ExpenseRepositoryShape {
  readonly findById: (
    id: string
  ) => Effect.Effect<Expense, ExpenseNotFound>
  readonly save: (expense: Expense) => Effect.Effect<void>
  readonly list: () => Effect.Effect<ReadonlyArray<Expense>>
}

export class ExpenseRepository extends Context.Service<
  ExpenseRepository,
  ExpenseRepositoryShape
>()("ExpenseApproval/ExpenseRepository") {}

export const makeExpenseRepositoryLayer = (
  seed: ReadonlyArray<Expense> = []
): Layer.Layer<ExpenseRepository> =>
  Layer.sync(ExpenseRepository, () => {
    const expenses = new Map(seed.map((expense) => [expense.id, expense]))

    return {
      findById: (id) => {
        const expense = expenses.get(id)
        return expense === undefined
          ? Effect.fail(new ExpenseNotFound({ id }))
          : Effect.succeed(expense)
      },
      save: (expense) =>
        Effect.sync(() => {
          expenses.set(expense.id, expense)
        }),
      list: () => Effect.sync(() => Array.from(expenses.values()))
    }
  })
