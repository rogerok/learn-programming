import { Schema } from "effect"
import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema
} from "effect/unstable/httpapi"
import {
  ApprovalPayloadSchema,
  ExpenseDraftSchema,
  ExpenseSchema
} from "../domain/expense.js"
import {
  ExpenseAlreadyReviewedHttp,
  ExpenseNotFoundHttp,
  InvalidExpenseInputHttp,
  ManualReviewRequiredHttp
} from "../errors.js"

export const HealthSchema = Schema.Struct({ status: Schema.Literal("ok") })
const CreatedExpenseSchema = ExpenseSchema.pipe(HttpApiSchema.status(201))

export const healthEndpoint = HttpApiEndpoint.get("health", "/health", {
  success: HealthSchema
})

export const getExpenseEndpoint = HttpApiEndpoint.get(
  "getExpense",
  "/expenses/:id",
  {
    params: { id: Schema.String },
    success: ExpenseSchema,
    error: ExpenseNotFoundHttp
  }
)

export const submitExpenseEndpoint = HttpApiEndpoint.post(
  "submitExpense",
  "/expenses",
  {
    payload: ExpenseDraftSchema,
    success: CreatedExpenseSchema,
    error: InvalidExpenseInputHttp
  }
)

export const approveExpenseEndpoint = HttpApiEndpoint.post(
  "approveExpense",
  "/expenses/:id/approve",
  {
    params: { id: Schema.String },
    payload: ApprovalPayloadSchema,
    success: ExpenseSchema,
    error: [
      ExpenseNotFoundHttp,
      ExpenseAlreadyReviewedHttp,
      ManualReviewRequiredHttp
    ]
  }
)

// Этап 3: baseline API публикует только уже работающие read endpoints.
export const ExpensesGroup = HttpApiGroup.make("expenses").add(
  healthEndpoint,
  getExpenseEndpoint
)

export const ExpensesApi = HttpApi.make("expenseApproval").add(ExpensesGroup)
