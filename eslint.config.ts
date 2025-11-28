import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    ignores: ["*/build/**", "*/dist/**", "*/coverage/**", "*/test/**", "/src/index.spec.ts", "*/*.test.ts"],
  },
  tseslint.configs.recommended,
]);
