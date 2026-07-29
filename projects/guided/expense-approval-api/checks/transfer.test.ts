import { Effect, Result } from "effect"
import { describe, expect, it } from "vitest"
import { importExpenses } from "../src/importExpenses.js"
import { makeHarness } from "./support.js"

const batch = [
  {
    vendor: "Rail Europe",
    amountCents: 24_500,
    category: "travel",
    submittedBy: "alice"
  },
  {
    vendor: "",
    amountCents: 0,
    category: "other",
    submittedBy: "alice"
  },
  {
    vendor: "TypeScript Workshop",
    amountCents: 75_000,
    category: "training",
    submittedBy: "bob"
  }
]

describe("independent transfer: batch boundary", () => {
  it("keeps input order and isolates item failures", async () => {
    const harness = makeHarness()
    const summary = await Effect.runPromise(
      importExpenses(batch).pipe(Effect.provide(harness.layer))
    )

    expect(summary.results).toEqual([
      { index: 0, _tag: "Imported", id: "expense-test-1" },
      { index: 1, _tag: "Rejected", reason: expect.any(String) },
      { index: 2, _tag: "Imported", id: "expense-test-2" }
    ])
    expect(harness.snapshot().map((expense) => expense.vendor)).toEqual([
      "Rail Europe",
      "TypeScript Workshop"
    ])
    expect(harness.calls).toEqual({ id: 2, clock: 2, save: 2 })
  })

  it("rejects a non-array outer value before processing items", async () => {
    const harness = makeHarness()
    const result = await Effect.runPromise(
      Effect.result(importExpenses({ expenses: batch })).pipe(
        Effect.provide(harness.layer)
      )
    )

    expect(Result.isFailure(result)).toBe(true)
    if (Result.isFailure(result)) {
      expect(result.failure._tag).toBe("InvalidExpenseInput")
    }
    expect(harness.snapshot()).toEqual([])
    expect(harness.calls).toEqual({ id: 0, clock: 0, save: 0 })
  })
})
