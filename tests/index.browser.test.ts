import { describe, expect, it } from "vitest";

// Browser smoke test - runs in real chromium under @vitest/browser+playwright.
// Imports the source through vite's transform so we verify the polyfill-free
// build path actually works in a browser environment end-to-end.

describe("browser smoke test", async () => {
  const mod = await import("../src/index.js");

  it("imports without referencing Node-only globals", () => {
    expect(typeof mod.toBigIntBE).toBe("function");
    expect(typeof mod.toBigIntLE).toBe("function");
    expect(typeof mod.toBufferBE).toBe("function");
    expect(typeof mod.toBufferLE).toBe("function");
    expect(typeof mod.toBufferBEInto).toBe("function");
    expect(typeof mod.toBufferLEInto).toBe("function");
  });

  it("falls back to pure JS (isNative === false) in browser", () => {
    expect(mod.isNative).toBe(false);
  });

  it("round-trips a 128-bit value through BE encoding", () => {
    const value = 0x1122334455667788_99aabbccddeeff00n;
    const buf = mod.toBufferBE(value, 16);
    expect(buf.length).toBe(16);
    expect(mod.toBigIntBE(buf)).toBe(value);
  });

  it("round-trips through LE encoding", () => {
    const value = 0xdeadbeefn;
    const buf = mod.toBufferLE(value, 8);
    expect(mod.toBigIntLE(buf)).toBe(value);
  });

  it("zero-allocation toBufferBEInto writes into a Uint8Array view", () => {
    const target = new Uint8Array(16);
    const written = mod.toBufferBEInto(0x1122334455667788n, 8, target, 4);
    expect(written).toBe(8);
    expect(target[4]).toBe(0x11);
    expect(target[11]).toBe(0x88);
  });

  it("hex round-trip works under browser TextEncoder/Decoder paths", () => {
    expect(mod.bigintToHex(0xdeadbeefn)).toBe("deadbeef");
    expect(mod.hexToBigint("0xdeadbeef")).toBe(0xdeadbeefn);
  });

  it("base64 round-trip", () => {
    const value = 0xdeadbeefn;
    expect(mod.base64ToBigint(mod.bigintToBase64(value))).toBe(value);
  });

  it("width safety ceiling is enforced in the browser too", () => {
    const target = new Uint8Array(8);
    expect(() => mod.toBufferBEInto(0n, (1 << 28) + 1, target, 0)).toThrow(
      /exceeds maximum/,
    );
  });
});
