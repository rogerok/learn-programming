import { Deferred, Effect, Queue } from "effect";
import { describe, expect, it } from "vitest";

import {
  makeBroadcaster,
  processOne,
  runLimited,
  startWorkers,
  submitWork,
  type WorkItem,
} from "../src/practice/coordination.js";

const withTimeout = <A>(effect: Effect.Effect<A>) => effect.pipe(Effect.timeout("500 millis"));

describe("Практика этапа 5: coordination primitives", () => {
  it("Queue + Deferred: возвращает результат именно своему producer", async () => {
    const program = Effect.scoped(
      Effect.gen(function* () {
        const queue = yield* Queue.bounded<WorkItem>(2);
        yield* Effect.forkScoped(Effect.forever(processOne(queue, (input) => input * 10)));

        return yield* Effect.all([submitWork(queue, 2), submitWork(queue, 7)], {
          concurrency: "unbounded",
        });
      }),
    );

    await expect(Effect.runPromise(withTimeout(program))).resolves.toEqual([20, 70]);
  });

  it("scoped workers: запускает все fibers и останавливает их вместе со scope", async () => {
    let active = 0;
    let stopped = 0;

    const worker = Effect.sync(() => {
      active += 1;
    }).pipe(
      Effect.zipRight(Effect.never),
      Effect.ensuring(
        Effect.sync(() => {
          active -= 1;
          stopped += 1;
        }),
      ),
    );

    const activeInsideScope = await Effect.runPromise(
      withTimeout(
        Effect.scoped(
          Effect.gen(function* () {
            yield* startWorkers(3, worker);
            yield* Effect.yieldNow();
            return active;
          }),
        ),
      ),
    );

    expect(activeInsideScope).toBe(3);
    expect(active).toBe(0);
    expect(stopped).toBe(3);
  });

  it("Semaphore: допускает ровно заданное число одновременных операций", async () => {
    let active = 0;
    let maxActive = 0;
    const completed: number[] = [];

    const operation = (input: number) =>
      Effect.acquireUseRelease(
        Effect.sync(() => {
          active += 1;
          maxActive = Math.max(maxActive, active);
        }),
        () => Effect.sleep("20 millis"),
        () =>
          Effect.sync(() => {
            active -= 1;
            completed.push(input);
          }),
      );

    await Effect.runPromise(withTimeout(runLimited([1, 2, 3, 4, 5], 2, operation)));

    expect(maxActive).toBe(2);
    expect(completed.sort((left, right) => left - right)).toEqual([1, 2, 3, 4, 5]);
  });

  it("PubSub: доставляет порядок каждому subscriber и завершает их со scope", async () => {
    const messages = ["held", "confirmed", "rejected"];
    const first: string[] = [];
    const second: string[] = [];
    let publishAfterClose: ((message: string) => Effect.Effect<void>) | undefined;

    await Effect.runPromise(
      withTimeout(
        Effect.scoped(
          Effect.gen(function* () {
            const broadcaster = yield* makeBroadcaster(2);
            publishAfterClose = broadcaster.publish;
            const firstDone = yield* Deferred.make<void>();
            const secondDone = yield* Deferred.make<void>();

            yield* broadcaster.subscribe((message) =>
              Effect.gen(function* () {
                first.push(message);
                if (first.length === messages.length) {
                  yield* Deferred.succeed(firstDone, undefined);
                }
              }),
            );
            yield* broadcaster.subscribe((message) =>
              Effect.gen(function* () {
                second.push(message);
                if (second.length === messages.length) {
                  yield* Deferred.succeed(secondDone, undefined);
                }
              }),
            );

            yield* Effect.forEach(messages, broadcaster.publish, { discard: true });
            yield* Effect.all([Deferred.await(firstDone), Deferred.await(secondDone)], {
              concurrency: "unbounded",
            });
          }),
        ),
      ),
    );

    expect(first).toEqual(messages);
    expect(second).toEqual(messages);

    if (publishAfterClose === undefined) {
      throw new Error("Broadcaster was not created");
    }
    await Effect.runPromise(publishAfterClose("after-close"));
    await Effect.runPromise(Effect.sleep("20 millis"));

    expect(first).toEqual(messages);
    expect(second).toEqual(messages);
  });
});
