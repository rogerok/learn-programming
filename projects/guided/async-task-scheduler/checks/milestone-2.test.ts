import { describe, expect, it } from "vitest";

import { TaskScheduler } from "../src/scheduler.js";

const deferred = <T = void>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe("Этап 2: состояние очереди", () => {
  it("показывает переходы queued → running → fulfilled", async () => {
    const scheduler = new TaskScheduler({ concurrency: 1 });
    const firstStarted = deferred();
    const releaseFirst = deferred();

    scheduler.add("first", async () => {
      firstStarted.resolve();
      await releaseFirst.promise;
      return "one";
    });
    scheduler.add("second", () => "two");

    expect(scheduler.snapshot()).toEqual([
      { id: "first", state: "queued" },
      { id: "second", state: "queued" },
    ]);

    const run = scheduler.run();
    await firstStarted.promise;

    expect(scheduler.snapshot()).toEqual([
      { id: "first", state: "running" },
      { id: "second", state: "queued" },
    ]);

    releaseFirst.resolve();
    await run;

    expect(scheduler.snapshot()).toEqual([
      { id: "first", state: "fulfilled" },
      { id: "second", state: "fulfilled" },
    ]);
  });
});
