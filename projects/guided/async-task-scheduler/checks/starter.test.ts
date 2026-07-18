import { describe, expect, it } from "vitest";

import { TaskScheduler } from "../src/scheduler.js";

describe("начальный планировщик", () => {
  it("хранит очередь и выполняет все добавленные задачи", async () => {
    const scheduler = new TaskScheduler({ concurrency: 2 });
    const events: string[] = [];

    scheduler.add("alpha", () => {
      events.push("alpha");
      return 1;
    });
    scheduler.add("beta", async () => {
      events.push("beta");
      return 2;
    });

    expect(scheduler.snapshot()).toEqual([
      { id: "alpha", state: "queued" },
      { id: "beta", state: "queued" },
    ]);

    const outcomes = await scheduler.run();

    expect(events).toEqual(["alpha", "beta"]);
    expect(outcomes).toHaveLength(2);
    expect(outcomes).toEqual(
      expect.arrayContaining([
        { id: "alpha", status: "fulfilled", value: 1 },
        { id: "beta", status: "fulfilled", value: 2 },
      ]),
    );
  });
});
