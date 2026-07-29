import { Effect } from "effect";

import { EventStoreMemory } from "./event-store.js";
import { handleTicketRequest } from "./transport.js";

const program = Effect.gen(function* () {
  const response = yield* handleTicketRequest({
    _tag: "OpenTicket",
    ticketId: "ticket_demo1",
    title: "Не приходит письмо для сброса пароля",
  });

  yield* Effect.sync(() => {
    console.log(JSON.stringify(response, null, 2));
  });
}).pipe(Effect.provide(EventStoreMemory));

Effect.runPromise(program).catch((cause: unknown) => {
  console.error(cause);
  process.exitCode = 1;
});
