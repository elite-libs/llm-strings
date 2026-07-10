import { copyFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));

async function copyDeclarations(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const source = join(dir, entry.name);

    if (entry.isDirectory()) {
      await copyDeclarations(source);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".d.ts")) {
      await copyFile(source, source.replace(/\.d\.ts$/, ".d.cts"));
    }
  }
}

await copyDeclarations(distDir);
