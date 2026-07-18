import { describe, expect, it } from "vitest";

import { TaskScheduler } from "../src/scheduler.js";

describe("Этап 3: распространение ошибок", () => {
  it("сохраняет ошибку конкретной задачи и продолжает очередь", async () => {
    const scheduler = new TaskScheduler({ concurrency: 1 });
    const failure = new Error("network unavailable");
    const events: string[] = [];

    scheduler.add("download", () => {
      events.push("download");
      throw failure;
    });
    scheduler.add("index", () => {
      events.push("index");
      return 42;
    });

    await expect(scheduler.run()).resolves.toEqual([
      { id: "download", status: "rejected", reason: failure },
      { id: "index", status: "fulfilled", value: 42 },
    ]);
    expect(events).toEqual(["download", "index"]);
    expect(scheduler.snapshot()).toEqual([
      { id: "download", state: "rejected" },
      { id: "index", state: "fulfilled" },
    ]);
  });
});
