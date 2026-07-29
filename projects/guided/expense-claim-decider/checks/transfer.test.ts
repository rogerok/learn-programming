import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";

import { runScenario } from "../src/scenario.js";
import {
  BorrowerId,
  CheckoutDevice,
  CompleteMaintenance,
  DeviceId,
  ReturnDevice,
  decodeDeviceLoanCommand,
  deviceLoanDecider,
} from "../src/transfer/device-loan.js";
import { runAt } from "./support.js";

const deviceId = DeviceId.make("dev_laptop01");
const borrowerId = BorrowerId.make("usr_alice001");
const checkout = CheckoutDevice.make({ deviceId, borrowerId });
const damagedReturn = ReturnDevice.make({ deviceId, condition: "damaged" });

describe("независимый transfer: device loan", () => {
  it("отправляет повреждённое устройство в maintenance двумя событиями", async () => {
    const result = await runAt(
      runScenario(deviceLoanDecider, [checkout, damagedReturn]),
    );

    expect(result.state._tag).toBe("InMaintenance");
    expect(result.history.map((event) => event._tag)).toEqual([
      "DeviceCheckedOut",
      "DeviceReturned",
      "MaintenanceRequested",
    ]);
  });

  it("возвращает устройство в Available после завершения ремонта", async () => {
    const program = Effect.gen(function* () {
      const complete = yield* decodeDeviceLoanCommand(
        CompleteMaintenance.make({ deviceId }),
      );
      return yield* runScenario(deviceLoanDecider, [
        checkout,
        damagedReturn,
        complete,
      ]);
    });

    const result = await runAt(program);
    expect(result.state._tag).toBe("Available");
    expect(result.history.map((event) => event._tag)).toEqual([
      "DeviceCheckedOut",
      "DeviceReturned",
      "MaintenanceRequested",
      "MaintenanceCompleted",
    ]);
  });

  it("не разрешает checkout во время maintenance", async () => {
    const result = await runAt(
      Effect.either(
        runScenario(deviceLoanDecider, [checkout, damagedReturn, checkout]),
      ),
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left._tag).toBe("InvalidDeviceTransition");
    }
  });
});
