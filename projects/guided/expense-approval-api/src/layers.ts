import { Layer } from "effect"
import type { Expense } from "./domain/expense.js"
import { AppClockLive } from "./services/AppClock.js"
import { makeExpenseRepositoryLayer } from "./services/ExpenseRepository.js"
import { IdGeneratorLive } from "./services/IdGenerator.js"

export const seedExpense: Expense = {
  id: "seed-expense",
  vendor: "Seed Office",
  amountCents: 1500,
  category: "equipment",
  submittedBy: "seed-user",
  submittedAt: "2026-01-01T09:00:00.000Z",
  status: "Pending",
  approvedAt: null,
  approvedBy: null
}

export const ApplicationLive = Layer.mergeAll(
  makeExpenseRepositoryLayer([seedExpense]),
  IdGeneratorLive,
  AppClockLive
)
