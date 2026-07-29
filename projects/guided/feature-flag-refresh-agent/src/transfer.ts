import { Data, Effect } from "effect";

export interface AuditReceipt {
  readonly idempotencyKey: string;
  readonly acceptedBy: "primary" | "secondary";
}

export class AuditWriteError extends Data.TaggedError("AuditWriteError")<{
  readonly retryable: boolean;
  readonly message: string;
}> {}

export class AuditDeadlineExceeded extends Data.TaggedError(
  "AuditDeadlineExceeded",
)<{
  readonly idempotencyKey: string;
}> {}

/**
 * Baseline выбирает первый успешный sink конкурентно.
 * Transfer-этап меняет политику для side-effecting write.
 */
export const submitAudit = (
  idempotencyKey: string,
  primary: Effect.Effect<AuditReceipt, AuditWriteError>,
  secondary: Effect.Effect<AuditReceipt, AuditWriteError>,
): Effect.Effect<AuditReceipt, AuditWriteError | AuditDeadlineExceeded> =>
  Effect.race(primary, secondary);
