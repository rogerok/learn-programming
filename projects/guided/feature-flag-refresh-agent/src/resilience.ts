import { Schedule } from "effect";

import type { AttemptError } from "./errors.js";

/**
 * Baseline-политика делает одну попытку и не повторяет ошибки.
 * Этап 1 заменяет её ограниченной selective retry policy.
 */
export const retryPolicy = Schedule.recurs(0).pipe(
  Schedule.whileInput<AttemptError>(() => false),
);
