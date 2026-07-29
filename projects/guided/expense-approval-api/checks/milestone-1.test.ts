import { Effect, Result } from "effect"
import { describe, expect, it } from "vitest"
import { submitExpense } from "../src/application/submitExpense.js"
import { makeHarness } from "./support.js"

const validDraft = {
  vendor: "Rail Europe",
  amountCents: 24_500,
  category: "travel",
  submittedBy: "alice"
} as const

describe("milestone 1: trusted boundary", () => {
  it("decodes, enriches and saves a valid draft", async () => {
    const harness = makeHarness()
    const expense = await Effect.runPromise(
      submitExpense(validDraft).pipe(Effect.provide(harness.layer))
    )

    expect(expense).toEqual({
      ...validDraft,
      id: "expense-test-1",
      submittedAt: "2026-07-26T10:00:01.000Z",
      status: "Pending",
      approvedAt: null,
      approvedBy: null
    })
    expect(harness.snapshot()).toEqual([expense])
    expect(harness.calls).toEqual({ id: 1, clock: 1, save: 1 })
  })

  it.each([
    ["empty vendor", { ...validDraft, vendor: "" }],
    ["fractional cents", { ...validDraft, amountCents: 12.5 }],
    ["amount outside limit", { ...validDraft, amountCents: 1_000_001 }],
    ["unknown category", { ...validDraft, category: "party" }],
    ["missing field", { vendor: "Rail Europe", amountCents: 100 }]
  ])("rejects %s before requesting dependencies", async (_label, input) => {
    const harness = makeHarness()
    const result = await Effect.runPromise(
      Effect.result(submitExpense(input)).pipe(Effect.provide(harness.layer))
    )

    expect(Result.isFailure(result)).toBe(true)
    if (Result.isFailure(result)) {
      expect(result.failure._tag).toBe("InvalidExpenseInput")
      expect(result.failure.reason.length).toBeGreaterThan(0)
    }
    expect(harness.snapshot()).toEqual([])
    expect(harness.calls).toEqual({ id: 0, clock: 0, save: 0 })
  })
})
