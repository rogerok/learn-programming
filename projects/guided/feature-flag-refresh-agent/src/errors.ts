import { Data } from "effect";

import type { FlagSource } from "./model.js";

export class GatewayUnavailable extends Data.TaggedError(
  "GatewayUnavailable",
)<{
  readonly source: FlagSource;
  readonly status: number;
}> {}

export class SnapshotRejected extends Data.TaggedError("SnapshotRejected")<{
  readonly source: FlagSource;
  readonly reason: string;
}> {}

export class AttemptTimeout extends Data.TaggedError("AttemptTimeout")<{
  readonly source: FlagSource;
}> {}

export class DeadlineExceeded extends Data.TaggedError("DeadlineExceeded")<{
  readonly operation: "refresh-flags";
}> {}

export class HostStopped extends Data.TaggedError("HostStopped")<{
  readonly operation: "host-callback";
}> {}

export type GatewayError = GatewayUnavailable | SnapshotRejected;
export type AttemptError = GatewayError | AttemptTimeout;
export type RefreshError = AttemptError | DeadlineExceeded;
