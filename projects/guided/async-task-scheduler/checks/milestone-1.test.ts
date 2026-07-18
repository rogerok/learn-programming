import { describe, expect, it } from "vitest";

import { TaskScheduler } from "../src/scheduler.js";

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe("Этап 1: порядок Promise-результатов", () => {
  it("возвращает результаты в порядке постановки, а не завершения", async () => {
    const scheduler = new TaskScheduler({ concurrency: 2 });
    const completionOrder: string[] = [];
    const releaseSlow = deferred();

    scheduler.add("slow", async () => {
      await releaseSlow.promise;
      completionOrder.push("slow");
      return 1;
    });
    scheduler.add("fast", async () => {
      completionOrder.push("fast");
      releaseSlow.resolve();
      return 2;
    });

    const outcomes = await scheduler.run();

    expect(completionOrder).toEqual(["fast", "slow"]);
    expect(outcomes).toEqual([
      { id: "slow", status: "fulfilled", value: 1 },
      { id: "fast", status: "fulfilled", value: 2 },
    ]);
  });
});
