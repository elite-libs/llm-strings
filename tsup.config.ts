import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/parse.ts",
    "src/normalize.ts",
    "src/validate.ts",
    "src/ai-sdk.ts",
    "src/providers.ts",
  ],
  format: ["esm", "cjs"],
  dts: false,
  clean: true,
  sourcemap: false,
  minify: "terser",
});
