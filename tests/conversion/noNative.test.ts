import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.unmock("../../src/converter.js");
});

describe("conversion: no native binding, Buffer builtins intact", () => {
  it("routes through JS driver while still using Buffer.readBigUInt64*/writeBigUInt64*", async () => {
    vi.doMock("../../src/converter.js", () => ({
      IS_BROWSER: false,
      loadNative: () => undefined,
    }));

    const mod = await import("../../src/conversion.js");
    const value = BigInt("0x1122334455667788");

    const be = mod.toBufferBE(value, 16);
    const le = mod.toBufferLE(value, 16);
    expect(mod.toBigIntBE(be)).toEqual(value);
    expect(mod.toBigIntLE(le)).toEqual(value);

    const tail = BigInt("0x11223344556677");
    expect(mod.toBigIntBE(mod.toBufferBE(tail, 7) as Buffer)).toEqual(tail);
    expect(mod.toBigIntLE(mod.toBufferLE(tail, 9) as Buffer)).toEqual(tail);
  });
});
