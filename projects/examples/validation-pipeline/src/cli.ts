import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { validateParcelOrder } from "./parcel-order.js";

const argumentsAfterScript = process.argv.slice(2);
const inputPath =
  argumentsAfterScript[0] === "--" ? argumentsAfterScript[1] : argumentsAfterScript[0];

if (inputPath === undefined) {
  console.error("Использование: pnpm cli -- <путь-к-order.json>");
  process.exitCode = 2;
} else {
  try {
    const source = await readFile(resolve(process.cwd(), inputPath), "utf8");
    const input: unknown = JSON.parse(source);
    const result = validateParcelOrder(input);

    if (result.kind === "invalid") {
      console.error(JSON.stringify({ status: "invalid", errors: result.errors }, null, 2));
      process.exitCode = 1;
    } else {
      console.log(JSON.stringify({ status: "valid", order: result.value }, null, 2));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Не удалось прочитать входные данные: ${message}`);
    process.exitCode = 2;
  }
}
