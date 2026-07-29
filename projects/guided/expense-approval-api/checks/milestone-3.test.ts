import { Layer } from "effect"
import { NodeHttpServer } from "@effect/platform-node"
import { HttpRouter } from "effect/unstable/http"
import { describe, expect, it } from "vitest"
import { makeApiLayer } from "../src/http/handlers.js"
import { makeHarness, pendingExpense } from "./support.js"

const jsonRequest = (url: string, body: unknown) =>
  new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  })

describe("milestone 3: HTTP vertical slice", () => {
  it("creates an expense through the real HTTP application", async () => {
    const harness = makeHarness()
    const web = HttpRouter.toWebHandler(
      makeApiLayer().pipe(
        HttpRouter.provideRequest(harness.layer),
        Layer.provide(NodeHttpServer.layerHttpServices)
      ),
      { disableLogger: true }
    )

    try {
      const response = await web.handler(
        jsonRequest("http://local/expenses", {
          vendor: "Rail Europe",
          amountCents: 24_500,
          category: "travel",
          submittedBy: "alice"
        })
      )

      expect(response.status).toBe(201)
      expect(await response.json()).toMatchObject({
        id: "expense-test-1",
        vendor: "Rail Europe",
        status: "Pending"
      })
      expect(harness.snapshot()).toHaveLength(1)
      expect(harness.calls).toEqual({ id: 1, clock: 1, save: 1 })
    } finally {
      await web.dispose()
    }
  })

  it("rejects an invalid HTTP payload before application dependencies", async () => {
    const harness = makeHarness()
    const web = HttpRouter.toWebHandler(
      makeApiLayer().pipe(
        HttpRouter.provideRequest(harness.layer),
        Layer.provide(NodeHttpServer.layerHttpServices)
      ),
      { disableLogger: true }
    )

    try {
      const response = await web.handler(
        jsonRequest("http://local/expenses", {
          vendor: "",
          amountCents: 0,
          category: "travel",
          submittedBy: "alice"
        })
      )

      expect(response.status).toBe(400)
      expect(harness.snapshot()).toEqual([])
      expect(harness.calls).toEqual({ id: 0, clock: 0, save: 0 })
    } finally {
      await web.dispose()
    }
  })

  it.each([
    ["missing", 404, "ExpenseNotFound"],
    ["too-large", 422, "ManualReviewRequired"],
    ["approved", 409, "ExpenseAlreadyReviewed"]
  ])(
    "maps %s approval failure to %i",
    async (kind, expectedStatus, expectedTag) => {
      const seed =
        kind === "missing"
          ? []
          : [
              pendingExpense(
                kind === "too-large"
                  ? { id: kind, amountCents: 100_001 }
                  : {
                      id: kind,
                      status: "Approved",
                      approvedAt: "2026-07-25T12:00:00.000Z",
                      approvedBy: "manager-original"
                    }
              )
            ]
      const harness = makeHarness(seed)
      const web = HttpRouter.toWebHandler(
        makeApiLayer().pipe(
          HttpRouter.provideRequest(harness.layer),
          Layer.provide(NodeHttpServer.layerHttpServices)
        ),
        { disableLogger: true }
      )

      try {
        const response = await web.handler(
          jsonRequest(`http://local/expenses/${kind}/approve`, {
            approvedBy: "manager-1"
          })
        )

        expect(response.status).toBe(expectedStatus)
        expect(await response.json()).toMatchObject({ _tag: expectedTag })
        expect(harness.calls.save).toBe(0)
      } finally {
        await web.dispose()
      }
    }
  )
})
