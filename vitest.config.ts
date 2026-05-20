import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";

const sharedAlias = {
  "#pkg": path.resolve(__dirname, "src/conversion.ts"),
  "@gsknnft/bigint-buffer/conversion": path.resolve(__dirname, "src/conversion.ts"),
  qwormhole: path.resolve(__dirname, "src"),
};

export default defineConfig({
  test: {
    mockReset: true,
    exclude: ["node_modules/**", "build/**", "dist/**"],
    alias: sharedAlias,
    coverage: {
      enabled: true,
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "dist/**",
        "**/*.d.ts",
        "bench/**",
        "tests/**/*.browser.test.ts",
        "src/**/*.browser.spec.ts",
      ],
    },
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: [
            "tests/**/*.{spec,test}.ts",
            "src/**/*.{spec,test}.ts",
          ],
          exclude: [
            "node_modules/**",
            "build/**",
            "dist/**",
            "tests/**/*.browser.test.ts",
            "src/**/*.browser.spec.ts",
          ],
          alias: sharedAlias,
        },
      },
      {
        test: {
          name: "browser",
          include: [
            "tests/**/*.browser.test.ts",
            "src/**/*.browser.spec.ts",
          ],
          alias: sharedAlias,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
