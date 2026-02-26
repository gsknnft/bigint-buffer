import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

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

  it("generates a browser root shim with named re-exports after build", () => {
    const browserEntry = path.resolve(__dirname, "..", "dist", "index.browser.js");
    expect(fs.existsSync(browserEntry)).toBe(true);

    const source = fs.readFileSync(browserEntry, "utf8");
    expect(source).toContain('export * from "./conversion/esm/index.browser.js";');
    expect(source).toContain("export const isNative = false;");
  });
});
