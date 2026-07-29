import { Clock, Data, Effect, Schema } from "effect";

import type { Decider } from "../decider.js";

export const DeviceId = Schema.String.pipe(
  Schema.pattern(/^dev_[a-z0-9]{8}$/),
  Schema.brand("DeviceId"),
);
export type DeviceId = Schema.Schema.Type<typeof DeviceId>;

export const BorrowerId = Schema.String.pipe(
  Schema.pattern(/^usr_[a-z0-9]{8}$/),
  Schema.brand("BorrowerId"),
);
export type BorrowerId = Schema.Schema.Type<typeof BorrowerId>;

export const CheckoutDevice = Schema.TaggedStruct("CheckoutDevice", {
  deviceId: DeviceId,
  borrowerId: BorrowerId,
});

export const ReturnDevice = Schema.TaggedStruct("ReturnDevice", {
  deviceId: DeviceId,
  condition: Schema.Literal("ok", "damaged"),
});

// Независимый transfer: schema уже показывает форму команды, но baseline
// не включает её в DeviceLoanCommand и не реализует maintenance lifecycle.
export const CompleteMaintenance = Schema.TaggedStruct("CompleteMaintenance", {
  deviceId: DeviceId,
});

export const DeviceLoanCommand = Schema.Union(CheckoutDevice, ReturnDevice);
export type DeviceLoanCommand = Schema.Schema.Type<typeof DeviceLoanCommand>;

const DeviceEventBase = {
  deviceId: DeviceId,
  occurredAt: Schema.Number,
};

export const DeviceCheckedOut = Schema.TaggedStruct("DeviceCheckedOut", {
  ...DeviceEventBase,
  borrowerId: BorrowerId,
});

export const DeviceReturned = Schema.TaggedStruct(
  "DeviceReturned",
  DeviceEventBase,
);

export const MaintenanceRequested = Schema.TaggedStruct(
  "MaintenanceRequested",
  DeviceEventBase,
);

export const MaintenanceCompleted = Schema.TaggedStruct(
  "MaintenanceCompleted",
  DeviceEventBase,
);

export const DeviceLoanEvent = Schema.Union(DeviceCheckedOut, DeviceReturned);
export type DeviceLoanEvent = Schema.Schema.Type<typeof DeviceLoanEvent>;

export type DeviceLoanState =
  | { readonly _tag: "Available" }
  | {
      readonly _tag: "CheckedOut";
      readonly deviceId: DeviceId;
      readonly borrowerId: BorrowerId;
    };

export class InvalidDeviceTransition extends Data.TaggedError(
  "InvalidDeviceTransition",
)<{
  readonly from: DeviceLoanState["_tag"];
  readonly command: string;
}> {}

export class DamagedReturnUnsupported extends Data.TaggedError(
  "DamagedReturnUnsupported",
)<{
  readonly deviceId: DeviceId;
}> {}

export class InvalidDeviceCommand extends Data.TaggedError(
  "InvalidDeviceCommand",
)<{
  readonly cause: unknown;
}> {}

export type DeviceLoanError =
  | InvalidDeviceTransition
  | DamagedReturnUnsupported;

export const decodeDeviceLoanCommand = (input: unknown) =>
  Schema.decodeUnknown(DeviceLoanCommand)(input).pipe(
    Effect.mapError((cause) => new InvalidDeviceCommand({ cause })),
  );

const initial: DeviceLoanState = { _tag: "Available" };

const decide = (
  state: DeviceLoanState,
  command: DeviceLoanCommand,
): Effect.Effect<ReadonlyArray<DeviceLoanEvent>, DeviceLoanError> =>
  Effect.gen(function* () {
    const occurredAt = yield* Clock.currentTimeMillis;

    switch (command._tag) {
      case "CheckoutDevice":
        if (state._tag !== "Available") {
          return yield* Effect.fail(
            new InvalidDeviceTransition({
              from: state._tag,
              command: command._tag,
            }),
          );
        }
        return [
          DeviceCheckedOut.make({
            deviceId: command.deviceId,
            borrowerId: command.borrowerId,
            occurredAt,
          }),
        ];

      case "ReturnDevice":
        if (
          state._tag !== "CheckedOut" ||
          state.deviceId !== command.deviceId
        ) {
          return yield* Effect.fail(
            new InvalidDeviceTransition({
              from: state._tag,
              command: command._tag,
            }),
          );
        }
        if (command.condition === "damaged") {
          return yield* Effect.fail(
            new DamagedReturnUnsupported({ deviceId: command.deviceId }),
          );
        }
        return [
          DeviceReturned.make({
            deviceId: command.deviceId,
            occurredAt,
          }),
        ];
    }
  });

const evolve = (
  _state: DeviceLoanState,
  event: DeviceLoanEvent,
): DeviceLoanState => {
  switch (event._tag) {
    case "DeviceCheckedOut":
      return {
        _tag: "CheckedOut",
        deviceId: event.deviceId,
        borrowerId: event.borrowerId,
      };
    case "DeviceReturned":
      return { _tag: "Available" };
  }
};

export const deviceLoanDecider = {
  initial,
  decide,
  evolve,
} satisfies Decider<
  DeviceLoanCommand,
  DeviceLoanState,
  DeviceLoanEvent,
  DeviceLoanError
>;
