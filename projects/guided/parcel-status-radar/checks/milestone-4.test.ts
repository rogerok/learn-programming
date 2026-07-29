import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

const runCli = (args: ReadonlyArray<string>) =>
  spawnSync(
    process.execPath,
    ["--import", "tsx", "src/main.ts", ...args],
    {
      cwd: projectRoot,
      encoding: "utf8",
      timeout: 5_000,
    },
  );

describe("Этап 4: @effect/cli и NodeRuntime", () => {
  it("разбирает variadic IDs и числовые options до handler", () => {
    const result = runCli([
      "scan",
      "PKG-101",
      "PKG-102",
      "PKG-101",
      "--concurrency",
      "3",
      "--batch-size",
      "3",
      "--retries",
      "2",
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout.trim().split(/\r?\n/)).toEqual([
      "PKG-101\tin_transit\tRiga",
      "PKG-102\tdelayed\tBerlin",
      "PKG-101\tin_transit\tRiga",
    ]);
  });

  it("генерирует help из declarative command tree", () => {
    const result = runCli(["--help"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Parcel Status Radar");
    expect(result.stdout).toContain("scan");
  });

  it("завершает процесс ненулевым кодом для invalid option", () => {
    const result = runCli([
      "scan",
      "PKG-101",
      "--concurrency",
      "0",
    ]);

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toContain("concurrency");
  });
});
