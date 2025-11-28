import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "#pkg": path.resolve(__dirname, "src/ts/index.ts"),
    },
  },
});
