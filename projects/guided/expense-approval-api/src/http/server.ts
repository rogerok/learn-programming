import { Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { NodeHttpServer } from "@effect/platform-node"
import { createServer } from "node:http"
import { ApplicationLive } from "../layers.js"
import { makeApiLayer } from "./handlers.js"

const ApiLive = makeApiLayer().pipe(HttpRouter.provideRequest(ApplicationLive))

export const ServerLive = HttpRouter.serve(ApiLive, {
  disableListenLog: true
}).pipe(
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
)
