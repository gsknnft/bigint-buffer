import { defineConfig } from "vite";
import { builtinModules } from "module";
import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import ts from "./tsconfig.json";
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import polyfillNode from 'rollup-plugin-polyfill-node';
const nodeBuiltins = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
];
const externalDeps = ["bindings", ...nodeBuiltins];

const tsPaths = ts.compilerOptions?.paths
  ? Object.keys(ts.compilerOptions.paths).map((key) => key.replace("/*", ""))
  : [];

export default defineConfig({
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
      external: [...externalDeps, ...tsPaths],
      output: {
        globals: {
          buffer: "Buffer",
          path: "path",
          fs: "fs",
        },
      },
      plugins: [    
      nodePolyfills(),
      commonjs({ defaultIsModuleExports: true }), nodeResolve()],
    },
  },
});
