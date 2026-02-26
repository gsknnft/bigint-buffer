import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { mkdtempSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ROOT_BROWSER_ENTRY_CONTENTS,
  writeRootBrowserEntryFile,
} from "../scripts/sync-conversion";

describe("browser entry packaging", () => {
  it("points browser exports to a dedicated browser shim", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8")
    ) as {
      browser?: string;
      exports?: Record<string, { browser?: string }>;
    };

    expect(pkg.browser).toBe("dist/index.browser.js");
    expect(pkg.exports?.["."]?.browser).toBe("./dist/index.browser.js");
  });

  it("generates a browser root shim with named re-exports", async () => {
    const tmpDir = mkdtempSync(path.join(os.tmpdir(), "bigint-buffer-browser-entry-"));
    const browserEntry = path.join(tmpDir, "dist", "index.browser.js");

    await writeRootBrowserEntryFile(browserEntry);

    expect(fs.existsSync(browserEntry)).toBe(true);
    const source = fs.readFileSync(browserEntry, "utf8");
    expect(source).toBe(ROOT_BROWSER_ENTRY_CONTENTS);
    expect(source).toContain('export * from "./conversion/esm/index.browser.js";');
    expect(source).toContain("export const isNative = false;");
  });
});
