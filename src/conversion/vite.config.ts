import { defineConfig } from "vite";
import { builtinModules } from "module";
import path from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const nodeBuiltins = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
];
const externalDeps = ["bindings", ...nodeBuiltins];

export default defineConfig({
  resolve: {
    alias: {
      "#pkg": path.resolve(__dirname, "src/ts/index.ts"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "bigint-buffer",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        if (format === "es") return "index.js";
        if (format === "cjs") return "index.cjs";
        if (format === "umd") return "index.umd.js";
        return `index.${format}.js`;
      },
    },

    outDir: "dist",
    rollupOptions: {
      external: [...externalDeps, 'bindings'],
      output: {
        globals: {
          bindings: "bindings",
          buffer: "Buffer",
          path: "path",
          fs: "fs",
        },
      },
      plugins: [    
      nodePolyfills(),
      ],
    },
  },
});
