import type { RefreshError } from "./errors.js";

export type FlagSource = "primary" | "replica";

export interface FlagSnapshot {
  readonly version: number;
  readonly source: FlagSource;
  readonly flags: Readonly<Record<string, boolean>>;
}

export type RefreshObservation =
  | {
      readonly _tag: "Updated";
      readonly snapshot: FlagSnapshot;
    }
  | {
      readonly _tag: "Unavailable";
      readonly error: RefreshError;
    };

export interface RefreshState {
  readonly lastGood: FlagSnapshot | null;
  readonly lastObservation: RefreshObservation | null;
}
