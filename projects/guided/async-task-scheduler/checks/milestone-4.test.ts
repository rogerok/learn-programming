import { describe, expect, it } from "vitest";

import { TaskScheduler } from "../src/scheduler.js";

const deferred = <T = void>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe("Этап 4: ограничение параллелизма и живая очередь", () => {
  it("не превышает concurrency и выполняет задачу, добавленную во время run", async () => {
    const scheduler = new TaskScheduler({ concurrency: 2 });
    const release = deferred();
    const twoTasksStarted = deferred();
    const events: string[] = [];
    let active = 0;
    let maximumActive = 0;
    let starts = 0;

    const track = async (id: string, wait: boolean) => {
      active += 1;
      starts += 1;
      maximumActive = Math.max(maximumActive, active);
      events.push(`start:${id}`);
      if (starts === 2) twoTasksStarted.resolve();
      if (wait) await release.promise;
      events.push(`end:${id}`);
      active -= 1;
      return id;
    };

    scheduler.add("seed", async () => {
      scheduler.add("late", () => track("late", false));
      return track("seed", true);
    });
    scheduler.add("two", () => track("two", true));
    scheduler.add("three", () => track("three", false));

    const run = scheduler.run();
    await twoTasksStarted.promise;

    expect(maximumActive).toBe(2);
    expect(events).not.toContain("start:three");

    release.resolve();
    const outcomes = await run;

    expect(maximumActive).toBe(2);
    expect(events).toContain("start:late");
    expect(outcomes.map(({ id }) => id)).toEqual([
      "seed",
      "two",
      "three",
      "late",
    ]);
  });
});
