import { Effect } from "effect"
import type { Expense } from "../domain/expense.js"
import type {
  ExpenseAlreadyReviewed,
  ExpenseNotFound,
  ManualReviewRequired
} from "../errors.js"
import { AppClock } from "../services/AppClock.js"
import { ExpenseRepository } from "../services/ExpenseRepository.js"

export const approveExpense = (
  id: string,
  approvedBy: string
): Effect.Effect<
  Expense,
  ExpenseNotFound | ExpenseAlreadyReviewed | ManualReviewRequired,
  ExpenseRepository | AppClock
> =>
  Effect.gen(function* () {
    const repository = yield* ExpenseRepository
    const expense = yield* repository.findById(id)
    const clock = yield* AppClock

    // Этап 2: baseline умеет happy path, но ещё не защищает invariants перехода.
    const approved: Expense = {
      ...expense,
      status: "Approved",
      approvedAt: yield* clock.now,
      approvedBy
    }

    yield* repository.save(approved)
    return approved
  })
