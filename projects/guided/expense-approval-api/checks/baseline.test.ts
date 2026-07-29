import { afterAll, describe, expect, it } from "vitest"
import { Layer } from "effect"
import { NodeHttpServer } from "@effect/platform-node"
import { HttpRouter } from "effect/unstable/http"
import { ApplicationLive, seedExpense } from "../src/layers.js"
import { makeApiLayer } from "../src/http/handlers.js"

const appLayer = makeApiLayer().pipe(
  HttpRouter.provideRequest(ApplicationLive),
  Layer.provide(NodeHttpServer.layerHttpServices)
)
const web = HttpRouter.toWebHandler(appLayer, { disableLogger: true })

afterAll(() => web.dispose())

describe("working starter", () => {
  it("serves health", async () => {
    const response = await web.handler(new Request("http://local/health"))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: "ok" })
  })

  it("reads the seeded expense through the repository service", async () => {
    const response = await web.handler(
      new Request("http://local/expenses/seed-expense")
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(seedExpense)
  })

  it("encodes ExpenseNotFound as 404", async () => {
    const response = await web.handler(
      new Request("http://local/expenses/missing")
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      _tag: "ExpenseNotFound",
      id: "missing"
    })
  })
})
