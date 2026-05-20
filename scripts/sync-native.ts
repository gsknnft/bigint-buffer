import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const source = path.join(rootDir, "build", "Release", "bigint_buffer.node");
const distTarget = path.join(rootDir, "dist", "build", "Release", "bigint_buffer.node");

const extraTargets: string[] = [];

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectory(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function removeDistArtifacts() {
  const distBuildDir = path.dirname(distTarget);
  await fs.rm(distBuildDir, { recursive: true, force: true });
}

async function copyNative() {
  if (!(await fileExists(source))) {
    // Native addon is optional — skip silently when not built.
    await removeDistArtifacts();
    return;
  }

  await removeDistArtifacts();
  await ensureDirectory(distTarget);
  await fs.copyFile(source, distTarget);
  console.log("sync-native: copied native addon to dist/");

  for (const target of extraTargets) {
    await ensureDirectory(target);
    await fs.copyFile(source, target);
  }
}

copyNative().catch((error) => {
  console.error("sync-native: unexpected error:", error);
  process.exitCode = 1;
});
