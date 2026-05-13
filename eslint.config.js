import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      "dist/",
      "coverage/",
      ".git/",
      ".claude/",
      "*.tsbuildinfo",
      "*.log",
      ".DS_Store",
      "Thumbs.db",
      "Desktop.ini",
      "pnpm-lock.yaml",
      "package-lock.json",
      "npm-shrinkwrap.json",
      "yarn.lock",
      "bun.lockb",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
