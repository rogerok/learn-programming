import { Schema } from "effect"
import { HttpApiSchema } from "effect/unstable/httpapi"

export class InvalidExpenseInput extends Schema.TaggedErrorClass<InvalidExpenseInput>()(
  "InvalidExpenseInput",
  { reason: Schema.String }
) {}

export class ExpenseNotFound extends Schema.TaggedErrorClass<ExpenseNotFound>()(
  "ExpenseNotFound",
  { id: Schema.String }
) {}

export class ExpenseAlreadyReviewed extends Schema.TaggedErrorClass<ExpenseAlreadyReviewed>()(
  "ExpenseAlreadyReviewed",
  { id: Schema.String, status: Schema.String }
) {}

export class ManualReviewRequired extends Schema.TaggedErrorClass<ManualReviewRequired>()(
  "ManualReviewRequired",
  { id: Schema.String, amountCents: Schema.Number }
) {}

export const InvalidExpenseInputHttp = InvalidExpenseInput.pipe(
  HttpApiSchema.status(400)
)
export const ExpenseNotFoundHttp = ExpenseNotFound.pipe(HttpApiSchema.status(404))
export const ExpenseAlreadyReviewedHttp = ExpenseAlreadyReviewed.pipe(
  HttpApiSchema.status(409)
)
export const ManualReviewRequiredHttp = ManualReviewRequired.pipe(
  HttpApiSchema.status(422)
)
