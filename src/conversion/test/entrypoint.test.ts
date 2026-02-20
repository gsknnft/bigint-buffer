import * as entry from "../index";
import * as innerEntry from "../src/index";
import { describe, expect, it } from "vitest";

describe("conversion entrypoint exports", () => {
  it("re-exports converter helpers", () => {
    expect(typeof entry.toBigIntBE).to.equal("function");
    expect(typeof entry.toBufferLE).to.equal("function");
    expect(typeof entry.findModuleRoot).to.equal("function");
    expect(typeof entry.loadNative).to.equal("function");
    expect(typeof innerEntry.toBigIntBE).to.equal("function");
    expect(typeof innerEntry.loadNative).to.equal("function");
  });

  it("findModuleRoot is callable", () => {
    const root = entry.findModuleRoot();
    expect(root === undefined || typeof root === "string").to.equal(true);
  });
});
