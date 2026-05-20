import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const HAD_DOCUMENT = "document" in globalThis;
const ORIGINAL_DOCUMENT = (globalThis as { document?: unknown }).document;

beforeAll(() => {
  (globalThis as { document?: unknown }).document = {};
});

afterAll(() => {
  if (HAD_DOCUMENT) {
    (globalThis as { document?: unknown }).document = ORIGINAL_DOCUMENT;
  } else {
    delete (globalThis as { document?: unknown }).document;
  }
});

describe("converter under a simulated browser environment", () => {
  it("classifies as browser and short-circuits Node-only module loads", async () => {
    vi.resetModules();
    const mod = await import("../../src/converter.js");
    expect(mod.IS_BROWSER).toBe(true);
    expect(mod.findModuleRoot()).toBeUndefined();
  });

  it("bufToHex takes the IS_BROWSER branch and handles plain ArrayBuffer", async () => {
    vi.resetModules();
    const mod = await import("../../src/conversion.js");

    const view = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const ab = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
    expect(mod.bufToHex(ab)).toBe("deadbeef");
    expect(mod.bufToHex(view)).toBe("deadbeef");
  });
});
