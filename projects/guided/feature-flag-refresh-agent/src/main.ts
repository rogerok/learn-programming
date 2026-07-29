import { createHost } from "./host.js";

const host = createHost();

try {
  const observation = await host.refreshNow();
  console.log(JSON.stringify(observation, null, 2));
} finally {
  await host.stop();
}
