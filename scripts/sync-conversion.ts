#!/usr/bin/env node
import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.resolve(rootDir, "src", "conversion", "dist");
const targetDir = path.resolve(rootDir, "dist", "conversion");
const rootBrowserEntry = path.resolve(rootDir, "dist", "index.browser.js");

export const ROOT_BROWSER_ENTRY_CONTENTS = [
  'export * from "./conversion/esm/index.browser.js";',
  "export const isNative = false;",
  "",
].join("\n");

async function ensureSource() {
  try {
    const info = await stat(sourceDir);
    if (!info.isDirectory()) {
      throw new Error("source is not a directory");
    }
  } catch {
    throw new Error(
      `Expected built conversion output at ${sourceDir}, run the conversion build first.`
    );
  }
}

async function syncConversion() {
  await ensureSource();
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(path.dirname(targetDir), { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true });
  await rm(path.join(targetDir, "build"), { recursive: true, force: true });
  await writeRootBrowserEntryFile(rootBrowserEntry);
}

export async function writeRootBrowserEntryFile(outputFile: string) {
  await mkdir(path.dirname(outputFile), { recursive: true });
  // Browser-safe root facade that preserves named exports for bundlers (e.g. Vite/Rollup + Solana deps).
  await writeFile(outputFile, ROOT_BROWSER_ENTRY_CONTENTS, "utf8");
}

const isMain =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  syncConversion().catch((error) => {
    console.error("Failed to sync conversion artifacts:", error);
    process.exitCode = 1;
  });
}
