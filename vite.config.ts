import { defineConfig } from "vite";
import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import ts from "./tsconfig.json";

const externalDeps = [
  "fs", "path", "os", "http", "https", "stream", "zlib", "react",
  'crypto', 'fs-extra', 'os', 'http', 'path', '@sigilnet/core',
  "net", "tls", "dns", "string_decoder", "timers", "tty",
  "cluster", "dgram", "@sigilnet/qtensors", "@sigilnet/qsignalsuite",
  "@sigilnet/qhub", "@sigilnet/mse", "@sigilnet/core",
  "protobufjs", "level", "vm", "constants", "process",
  "events", "buffer", "util", "child_process", "readline",
  "json2csv", "jsonwebtoken", "pako", "events", "node:events",
  "eventemitter3", "borscht", "@solana/web3.js",
  "@solana/spl-token", "@solana/bu",  // ... add other dependencies as needed
  // keep only runtime externals here
];

const tsPaths = ts.compilerOptions?.paths
  ? Object.keys(ts.compilerOptions.paths).map(key => key.replace("/*", ""))
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
      }
    },
    
    outDir: "dist",
    rollupOptions: {
      external: [...externalDeps, ...tsPaths],
      plugins: [commonjs({ defaultIsModuleExports: true }), nodeResolve()],    },
  },
});