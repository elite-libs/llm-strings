import { stat } from "node:fs/promises";

const MAX_BASE_BYTES = 4_096;
const entryBytes = (await stat("dist/index.js")).size;

// tsup may put shared base code in one ESM chunk. The CJS entry is standalone,
// so it is the conservative, format-independent ceiling for the base surface.
const cjsBytes = (await stat("dist/index.cjs")).size;

if (cjsBytes > MAX_BASE_BYTES) {
  throw new Error(
    `Base bundle is ${cjsBytes} bytes; limit is ${MAX_BASE_BYTES} bytes`,
  );
}

console.log(
  `Base bundle: ${cjsBytes} bytes CJS (${entryBytes} byte ESM entry)`,
);
