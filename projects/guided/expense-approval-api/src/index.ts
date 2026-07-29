import { Effect, Layer } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { ServerLive } from "./http/server.js"

const program = Effect.logInfo("Expense API: http://localhost:3000").pipe(
  Effect.andThen(Layer.launch(ServerLive))
)

NodeRuntime.runMain(program)
