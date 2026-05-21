import { afterEach, describe, expect, it, vi } from "vitest";
vi.unmock("../src/converter");

afterEach(() => {
  vi.resetModules();
});

describe("no native binding, Buffer builtins available", () => {
  // Covers the "native-Buffer-builtin" branches of read64/write64 - the
  // single-line delegations to Buffer.prototype.{read,write}BigUInt64{LE,BE}.
  // The pure-JS fallback spec patches those builtins to undefined, so it
  // never reaches them; this spec leaves them intact and only suppresses the
  // C++ binding so we still flow through the JS-driver layer.
  it("uses Buffer built-in 64-bit ops when native binding is absent", async () => {
    vi.doMock("../src/converter", () => ({
      IS_BROWSER: false,
      loadNative: () => undefined,
    }));

    const mod = await import("../src/index.js");
    expect(mod.isNative).toBe(false);

    const value = 0x1122334455667788n;
    const be = mod.toBufferBE(value, 16);
    const le = mod.toBufferLE(value, 16);
    expect(mod.toBigIntBE(be)).toBe(value);
    expect(mod.toBigIntLE(le)).toBe(value);

    // Round-trip non-8-multiple widths through the JS driver as well.
    const tail = 0x11223344556677n;
    expect(mod.toBigIntBE(mod.toBufferBE(tail, 7))).toBe(tail);
    expect(mod.toBigIntLE(mod.toBufferLE(tail, 9))).toBe(tail);
  });
});
