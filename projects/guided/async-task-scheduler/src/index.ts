import { TaskScheduler } from "./scheduler.js";

const scheduler = new TaskScheduler({ concurrency: 2 });

scheduler.add("profile", async () => {
  await Promise.resolve();
  return { name: "Ada" };
});

scheduler.add("permissions", () => ["read", "write"]);

console.log("До запуска:", scheduler.snapshot());
console.log("Результаты:", await scheduler.run());
