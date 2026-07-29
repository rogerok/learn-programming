import { Console, Data, Effect } from "effect";

import type { CarrierGatewayService } from "./carrier.js";
import type { ParcelReportRow, TrackingId } from "./domain.js";
import {
  defaultScanOptions,
  scanParcels,
  type ScanOptions,
} from "./pipeline.js";

export interface ScanAction {
  readonly trackingIds: ReadonlyArray<TrackingId>;
  readonly concurrency: number;
  readonly batchSize: number;
  readonly maxRetries: number;
}

export class InvalidCliOption extends Data.TaggedError("InvalidCliOption")<{
  readonly message: string;
}> {}


export const executeScanAction = (
  gateway: CarrierGatewayService,
  action: ScanAction,
): Effect.Effect<
  ReadonlyArray<ParcelReportRow>,
  InvalidCliOption
> => {
  if (action.trackingIds.length === 0) {
    return Effect.fail(
      new InvalidCliOption({ message: "Передайте хотя бы один tracking ID" }),
    );
  }
  if (!Number.isInteger(action.concurrency) || action.concurrency <= 0) {
    return Effect.fail(
      new InvalidCliOption({
        message: "concurrency должен быть положительным целым числом",
      }),
    );
  }
  if (!Number.isInteger(action.batchSize) || action.batchSize <= 0) {
    return Effect.fail(
      new InvalidCliOption({
        message: "batch-size должен быть положительным целым числом",
      }),
    );
  }
  if (!Number.isInteger(action.maxRetries) || action.maxRetries < 0) {
    return Effect.fail(
      new InvalidCliOption({
        message: "retries должен быть неотрицательным целым числом",
      }),
    );
  }

  const options: ScanOptions = {
    ...defaultScanOptions,
    concurrency: action.concurrency,
    batchSize: action.batchSize,
    resilience: {
      ...defaultScanOptions.resilience,
      maxRetries: action.maxRetries,
    },
  };

  return scanParcels(action.trackingIds, gateway, options);
};

export const formatReportRow = (row: ParcelReportRow): string =>
  row._tag === "Found"
    ? `${row.trackingId}\t${row.status.state}\t${row.status.hub}`
    : `${row.trackingId}\tERROR\t${row.error._tag}`;

export const printReport = (
  rows: ReadonlyArray<ParcelReportRow>,
): Effect.Effect<void> =>
  Effect.forEach(rows, (row) => Console.log(formatReportRow(row)), {
    discard: true,
  });
