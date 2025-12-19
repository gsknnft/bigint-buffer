#!/usr/bin/env node
const { join } = require("node:path");
const { existsSync } = require("node:fs");
const { execSync } = require("node:child_process");

const forceRebuild = process.env.BIGINT_BUFFER_FORCE_REBUILD === "1";

const shouldSkip =
  process.env.BIGINT_BUFFER_SKIP_NATIVE === "1" ||
  process.env.BIGINT_BUFFER_SKIP_POSTINSTALL === "1" ||
  process.env.npm_config_bigint_buffer_skip_native === "true" ||
  process.env.npm_config_bigint_buffer_skip_native === "1";

if (shouldSkip) {
  console.log("bigint-buffer: skipping native rebuild per configuration");
  process.exit(0);
}

if (process.platform === "win32" && !forceRebuild) {
  console.log(
    "bigint-buffer: native binary ships prebuilt; skipping postinstall rebuild on Windows. Set BIGINT_BUFFER_FORCE_REBUILD=1 to override."
  );
  process.exit(0);
}

const bindingPath = join(__dirname, "..", "dist", "build", "Release", "bigint_buffer.node");
if (existsSync(bindingPath) && !forceRebuild) {
  console.log("bigint-buffer: native addon already present in dist; skipping rebuild");
  process.exit(0);
}

try {
  console.log("bigint-buffer: rebuilding native addon via node-gyp");
  execSync("node-gyp rebuild", { stdio: "inherit" });
} catch (error) {
  console.warn("bigint-buffer: rebuild failed; JS fallback will be used", error);
  process.exit(0);
}
