import { Effect } from "effect"
import { ExpenseRepository } from "../services/ExpenseRepository.js"

export const getExpense = (id: string) =>
  Effect.gen(function* () {
    const repository = yield* ExpenseRepository
    return yield* repository.findById(id)
  })
