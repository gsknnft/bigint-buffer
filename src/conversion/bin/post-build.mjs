import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const manifests = [
  {
    file: path.join(distDir, "esm", "package.json"),
    contents: { type: "module" },
  },
  {
    file: path.join(distDir, "cjs", "package.json"),
    contents: { type: "commonjs" },
  },
];

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeManifests() {
  const tasks = manifests.map(async ({ file, contents }) => {
    await ensureDir(file);
    await fs.writeFile(file, JSON.stringify(contents), "utf8");
  });
  await Promise.all(tasks);
}

async function writeCompatStubs() {
  const cjsStubPath = path.join(distDir, "cjs", "index.node.js");
  const esmStubPath = path.join(distDir, "esm", "index.node.js");
  await ensureDir(cjsStubPath);
  await ensureDir(esmStubPath);
  await fs.writeFile(
    cjsStubPath,
    "'use strict';\nconst mod = require('./index.js');\nmodule.exports = mod;\nmodule.exports.default = mod;\n",
    "utf8"
  );
  await fs.writeFile(
    esmStubPath,
    "export * from './index.js';\nexport { default } from './index.js';\n",
    "utf8"
  );
}

Promise.all([writeManifests(), writeCompatStubs()]).catch((error) => {
  console.error("post-build: failed to prepare package manifests", error);
  process.exitCode = 1;
});
