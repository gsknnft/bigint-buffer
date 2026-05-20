import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const typesDir = path.resolve(rootDir, "dist", "types");

const targets = [
  {
    source: path.join(typesDir, "index.d.ts"),
    destination: path.join(rootDir, "dist", "index.d.ts"),
  },
  {
    source: path.join(typesDir, "conversion.d.ts"),
    destination: path.join(rootDir, "dist", "conversion.d.ts"),
  },
  {
    source: path.join(typesDir, "converter.d.ts"),
    destination: path.join(rootDir, "dist", "converter.d.ts"),
  },
];

async function ensureDirectory(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function copyFiles() {
  for (const { source, destination } of targets) {
    try {
      await ensureDirectory(destination);
      await fs.copyFile(source, destination);
    } catch (err) {
      console.warn(`copy-dts: could not copy ${source}: ${(err as Error).message}`);
    }
  }
}

copyFiles().catch((error) => {
  console.error("Failed to copy declaration files:", error);
  process.exitCode = 1;
});
