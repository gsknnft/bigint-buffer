import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/conversion/test/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "#pkg": path.resolve(__dirname, "src/ts/index.ts"),
    },
  },
});
