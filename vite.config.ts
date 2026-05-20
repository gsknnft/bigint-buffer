import { defineConfig } from "vite";
import { builtinModules } from "module";
import path from "node:path";

const nodeBuiltins = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
];
const externalDeps = ["bindings", "node-gyp-build", ...nodeBuiltins];

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "bigint-buffer",
      formats: ["es"],
      fileName: () => "index.js",
    },
    outDir: "dist",
    rollupOptions: {
      external: externalDeps,
      output: {
        globals: {
          buffer: "Buffer",
          path: "path",
          fs: "fs",
        },
      },
    },
  },
});
