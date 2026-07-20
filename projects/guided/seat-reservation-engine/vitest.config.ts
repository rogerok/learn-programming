import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["checks/**/*.test.ts"],
    testTimeout: 5_000,
    hookTimeout: 5_000,
    sequence: {
      concurrent: false,
    },
  },
});
