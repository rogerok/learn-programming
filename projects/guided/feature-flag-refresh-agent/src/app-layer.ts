import { Layer } from "effect";

import { FlagGatewayDemo } from "./flag-gateway.js";
import { FlagStoreLive } from "./flag-store.js";

export const AppLive = Layer.merge(FlagGatewayDemo, FlagStoreLive);
