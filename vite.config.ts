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
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        conversion: path.resolve(__dirname, "src/conversion.ts"),
        converter: path.resolve(__dirname, "src/converter.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      external: externalDeps,
      output: {
        // Ensure cross-entry imports (e.g. index.js -> conversion.js) stay
        // as separate files instead of being inlined.
        preserveModules: false,
        chunkFileNames: "[name].js",
      },
    },
  },
});
