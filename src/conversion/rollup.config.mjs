import path from "node:path";
import { fileURLToPath } from "node:url";
import { builtinModules } from "node:module";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import polyfillNode from "rollup-plugin-polyfill-node";
import terser from "@rollup/plugin-terser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const input = path.resolve(__dirname, "index.ts");
const distPath = (...segments) => path.resolve(__dirname, "dist", ...segments);

const builtinIds = [...new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)])];
const externalNode = ["bindings", ...builtinIds];
const extensions = [".ts", ".js", ".mjs", ".cjs", ".json"];

const tsconfigPath = path.resolve(__dirname, "tsconfig.rollup.json");

const makeTsPlugin = (outDir) =>
  typescript({
    tsconfig: tsconfigPath,
    compilerOptions: {
      module: "NodeNext",
      moduleResolution: "NodeNext",
      outDir,
    },
  });

const makeNodePlugins = (outDir) => [
  makeTsPlugin(outDir),
  nodeResolve({ extensions, preferBuiltins: true }),
  commonjs({ defaultIsModuleExports: true }),
  json(),
];

const bindingsShim = replace({
  preventAssignment: true,
  values: {
    'require("bindings")': "undefined",
    "require('bindings')": "undefined",
    'require("path")': "undefined",
    "require('path')": "undefined",
    'require("fs")': "undefined",
    "require('fs')": "undefined",
  },
});

const makeBrowserPlugins = (outDir) => [
  makeTsPlugin(outDir),
  nodeResolve({ extensions, browser: true, preferBuiltins: false }),
  json(),
  bindingsShim,
  polyfillNode(),
];

export default [
  {
    input,
    external: externalNode,
    output: {
      dir: distPath("esm"),
      entryFileNames: "[name].js",
      chunkFileNames: "[name].js",
      format: "es",
      sourcemap: false,
    },
    plugins: makeNodePlugins(distPath("esm")),
    treeshake: false,
  },
  {
    input,
    external: externalNode,
    output: {
      dir: distPath("cjs"),
      entryFileNames: "[name].js",
      chunkFileNames: "[name].js",
      format: "cjs",
      sourcemap: false,
      exports: "named",
    },
    plugins: makeNodePlugins(distPath("cjs")),
    treeshake: false,
  },
  {
    input,
    output: {
      file: distPath("esm/index.browser.js"),
      format: "es",
      sourcemap: false,
      inlineDynamicImports: true,
    },
    plugins: makeBrowserPlugins(distPath("esm")),
    treeshake: false,
  },
  {
    input,
    output: {
      file: distPath("esm/bundle.js"),
      format: "es",
      sourcemap: false,
      inlineDynamicImports: true,
    },
    plugins: makeBrowserPlugins(distPath("esm")),
    treeshake: false,
  },
  {
    input,
    output: {
      file: distPath("bundle.umd.js"),
      format: "umd",
      sourcemap: false,
      name: "BigIntBuffer",
      inlineDynamicImports: true,
    },
    plugins: makeBrowserPlugins(path.resolve(__dirname, "dist")),
    treeshake: false,
  },
  {
    input,
    output: {
      file: distPath("bundle.iife.js"),
      format: "iife",
      sourcemap: false,
      name: "BigIntBuffer",
      inlineDynamicImports: true,
    },
    plugins: makeBrowserPlugins(path.resolve(__dirname, "dist")),
    treeshake: false,
  },
  {
    input,
    output: {
      file: distPath("esm/bundle.min.js"),
      format: "es",
      sourcemap: false,
      inlineDynamicImports: true,
    },
    plugins: [...makeBrowserPlugins(distPath("esm")), terser({ format: { comments: false } })],
    treeshake: false,
  },
];
