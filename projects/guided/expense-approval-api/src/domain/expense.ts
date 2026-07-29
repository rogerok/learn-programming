import { Schema } from "effect"

export const ExpenseCategorySchema = Schema.Literals([
  "travel",
  "equipment",
  "training",
  "other"
])

export const ExpenseDraftSchema = Schema.Struct({
  vendor: Schema.NonEmptyString,
  amountCents: Schema.Int.check(
    Schema.isBetween({ minimum: 1, maximum: 1_000_000 })
  ),
  category: ExpenseCategorySchema,
  submittedBy: Schema.NonEmptyString
})

export type ExpenseDraft = typeof ExpenseDraftSchema.Type

export const ExpenseStatusSchema = Schema.Literals(["Pending", "Approved"])

export const ExpenseSchema = Schema.Struct({
  id: Schema.NonEmptyString,
  vendor: Schema.NonEmptyString,
  amountCents: Schema.Int,
  category: ExpenseCategorySchema,
  submittedBy: Schema.NonEmptyString,
  submittedAt: Schema.NonEmptyString,
  status: ExpenseStatusSchema,
  approvedAt: Schema.NullOr(Schema.NonEmptyString),
  approvedBy: Schema.NullOr(Schema.NonEmptyString)
})

export type Expense = typeof ExpenseSchema.Type

export const ApprovalPayloadSchema = Schema.Struct({
  approvedBy: Schema.NonEmptyString
})

export type ApprovalPayload = typeof ApprovalPayloadSchema.Type
