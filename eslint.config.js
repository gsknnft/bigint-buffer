import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "**/build/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.rollup.cache/**",
      "**/node_modules/**",
      "**/prebuilds/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,mts,cts}", "bench/**/*.ts"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      // Tests routinely poke at things that aren't part of the public API.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { sourceType: "commonjs", globals: { ...globals.node } },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);
