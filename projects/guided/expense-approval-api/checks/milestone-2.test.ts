import { Effect, Result } from "effect"
import { describe, expect, it } from "vitest"
import { approveExpense } from "../src/application/approveExpense.js"
import { makeHarness, pendingExpense } from "./support.js"

describe("milestone 2: approval transition", () => {
  it("approves a pending expense at the automatic limit", async () => {
    const initial = pendingExpense({ amountCents: 100_000 })
    const harness = makeHarness([initial])
    const approved = await Effect.runPromise(
      approveExpense(initial.id, "manager-1").pipe(Effect.provide(harness.layer))
    )

    expect(approved).toEqual({
      ...initial,
      status: "Approved",
      approvedAt: "2026-07-26T10:00:01.000Z",
      approvedBy: "manager-1"
    })
    expect(harness.snapshot()).toEqual([approved])
    expect(harness.calls).toEqual({ id: 0, clock: 1, save: 1 })
  })

  it("requires manual review above the limit without changing state", async () => {
    const initial = pendingExpense({ amountCents: 100_001 })
    const harness = makeHarness([initial])
    const result = await Effect.runPromise(
      Effect.result(approveExpense(initial.id, "manager-1")).pipe(
        Effect.provide(harness.layer)
      )
    )

    expect(Result.isFailure(result)).toBe(true)
    if (Result.isFailure(result)) {
      expect(result.failure).toMatchObject({
        _tag: "ManualReviewRequired",
        id: initial.id,
        amountCents: 100_001
      })
    }
    expect(harness.snapshot()).toEqual([initial])
    expect(harness.calls).toEqual({ id: 0, clock: 0, save: 0 })
  })

  it("rejects an already reviewed expense without overwriting it", async () => {
    const initial = pendingExpense({
      status: "Approved",
      approvedAt: "2026-07-25T12:00:00.000Z",
      approvedBy: "manager-original"
    })
    const harness = makeHarness([initial])
    const result = await Effect.runPromise(
      Effect.result(approveExpense(initial.id, "manager-2")).pipe(
        Effect.provide(harness.layer)
      )
    )

    expect(Result.isFailure(result)).toBe(true)
    if (Result.isFailure(result)) {
      expect(result.failure).toMatchObject({
        _tag: "ExpenseAlreadyReviewed",
        id: initial.id,
        status: "Approved"
      })
    }
    expect(harness.snapshot()).toEqual([initial])
    expect(harness.calls).toEqual({ id: 0, clock: 0, save: 0 })
  })

  it("preserves ExpenseNotFound for an unknown id", async () => {
    const harness = makeHarness()
    const result = await Effect.runPromise(
      Effect.result(approveExpense("missing", "manager-1")).pipe(
        Effect.provide(harness.layer)
      )
    )

    expect(Result.isFailure(result)).toBe(true)
    if (Result.isFailure(result)) {
      expect(result.failure).toMatchObject({
        _tag: "ExpenseNotFound",
        id: "missing"
      })
    }
    expect(harness.calls).toEqual({ id: 0, clock: 0, save: 0 })
  })
})
