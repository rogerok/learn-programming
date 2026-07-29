import { Effect } from "effect"
import type { Expense, ExpenseDraft } from "../domain/expense.js"
import type { InvalidExpenseInput } from "../errors.js"
import { AppClock } from "../services/AppClock.js"
import { ExpenseRepository } from "../services/ExpenseRepository.js"
import { IdGenerator } from "../services/IdGenerator.js"

export const submitExpense = (
  input: unknown
): Effect.Effect<
  Expense,
  InvalidExpenseInput,
  ExpenseRepository | IdGenerator | AppClock
> =>
  Effect.gen(function* () {
    // Этап 1: baseline сохраняет корректный trusted input, но пока доверяет unknown.
    const draft = input as ExpenseDraft
    const repository = yield* ExpenseRepository
    const idGenerator = yield* IdGenerator
    const clock = yield* AppClock
    const id = yield* idGenerator.next
    const submittedAt = yield* clock.now

    const expense: Expense = {
      ...draft,
      id,
      submittedAt,
      status: "Pending",
      approvedAt: null,
      approvedBy: null
    }

    yield* repository.save(expense)
    return expense
  })
