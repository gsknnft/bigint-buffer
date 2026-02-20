import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    mockReset: true,
    exclude: ["node_modules/**", "build/**", "dist/**"],
    coverage: {

      enabled: true,
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "dist/**",
        "src/conversion/.types/**",
        "src/conversion/index.ts",
        "src/conversion/src/index.ts",
        "**/*.d.ts",
        "src/index.bench.ts"
      ]
    },
    alias: {
      '#pkg': '/src/conversion/src/ts/index.ts',
      '@gsknnft/bigint-buffer/conversion': '/src/conversion/src/ts/index.ts',
      qwormhole: path.resolve(__dirname, "src"),
    },
  },
});
