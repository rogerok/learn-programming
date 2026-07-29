import { Effect, Layer } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { getExpense } from "../application/getExpense.js"
import { ExpensesApi } from "./api.js"

export const ExpensesHandlersLive = HttpApiBuilder.group(
  ExpensesApi,
  "expenses",
  (handlers) =>
    handlers
      .handle("health", () => Effect.succeed({ status: "ok" as const }))
      .handle("getExpense", ({ params }) => getExpense(params.id))
  // Этап 3: добавьте write handlers после включения endpoints в ExpensesGroup.
)

export const makeApiLayer = () =>
  HttpApiBuilder.layer(ExpensesApi).pipe(Layer.provide(ExpensesHandlersLive))
