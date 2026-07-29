import { describe, expect, it } from "vitest";

import { createHost } from "../src/host.js";
import { makeGatewayHarness } from "./support.js";

describe("milestone 4: one ManagedRuntime per host", () => {
  it("shares state and closes the layer once on stop", async () => {
    const gateway = makeGatewayHarness({
      primary: [{ _tag: "Success", version: 7 }],
    });
    const host = createHost(gateway.appLayer);

    const observation = await host.refreshNow();
    const status = await host.readStatus();

    expect(observation._tag).toBe("Updated");
    expect(status.lastGood?.version).toBe(7);
    expect(gateway.snapshot().opened).toBe(1);
    expect(gateway.snapshot().closed).toBe(0);

    await host.stop();

    expect(gateway.snapshot().closed).toBe(1);
    await expect(host.refreshNow()).rejects.toMatchObject({
      _tag: "HostStopped",
    });
  });
});
