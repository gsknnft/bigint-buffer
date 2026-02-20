import { defineConfig } from "vite";
import { builtinModules } from "module";
import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import ts from "./tsconfig.json";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const nodeBuiltins = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
];
const externalDeps = ["bindings", ...nodeBuiltins];

const tsPaths = ts.compilerOptions?.paths
  ? Object.keys(ts.compilerOptions.paths).map((key) => key.replace("/*", ""))
  : [];

export default defineConfig({
  resolve: {
    alias: {
      "./converter": path.resolve(__dirname, "src/conversion/src/ts/converter.ts"),
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
        commonjs({ defaultIsModuleExports: true }),
        nodeResolve({ extensions: [".mjs", ".js", ".ts", ".json", ".node"] }),
        {
          name: "resolve-conversion-converter",
          resolveId(source, importer) {
            if (
              source === "./converter" &&
              importer &&
              (importer.includes(path.join("src", "conversion", "src", "ts")) ||
                importer.includes("converter?commonjs-external"))
            ) {
              return path.resolve(__dirname, "src/conversion/src/ts/converter.ts");
            }
            return null;
          },
        },
        {
          name: "esm-require-and-dirname-shim",
          renderChunk(code, chunk, options) {
            if (options.format !== "es" || !chunk.isEntry) return null;

            const shim =
              'import { createRequire as __createRequire } from "node:module";\n' +
              'import { fileURLToPath as __fileURLToPath } from "node:url";\n' +
              'import { dirname as __dirnameFn } from "node:path";\n' +
              "const require = __createRequire(import.meta.url);\n" +
              "const __filename = __fileURLToPath(import.meta.url);\n" +
              "const __dirname = __dirnameFn(__filename);\n\n";

            return { code: shim + code, map: null };
          },
        },
      ],
    },
  },
});
