import { afterEach, describe, expect, it, vi } from "vitest";

type BufferProtoPatched = {
  readBigUInt64LE?: Buffer["readBigUInt64LE"];
  readBigUInt64BE?: Buffer["readBigUInt64BE"];
  writeBigUInt64LE?: Buffer["writeBigUInt64LE"];
  writeBigUInt64BE?: Buffer["writeBigUInt64BE"];
};

const restoreBufferProto = (original: BufferProtoPatched) => {
  const proto = Buffer.prototype as BufferProtoPatched;
  proto.readBigUInt64LE = original.readBigUInt64LE;
  proto.readBigUInt64BE = original.readBigUInt64BE;
  proto.writeBigUInt64LE = original.writeBigUInt64LE;
  proto.writeBigUInt64BE = original.writeBigUInt64BE;
};

afterEach(() => {
  vi.resetModules();
  vi.unmock("./conversion/src/ts/converter");
});

describe("top-level manual fallback branches", () => {
  it("uses pure JS fallback with manual 64-bit code paths when native is unavailable", async () => {
    vi.doMock("./conversion/src/ts/converter", () => ({
      IS_BROWSER: false,
      loadNative: () => undefined,
    }));

    const proto = Buffer.prototype as BufferProtoPatched;
    const original: BufferProtoPatched = {
      readBigUInt64LE: proto.readBigUInt64LE,
      readBigUInt64BE: proto.readBigUInt64BE,
      writeBigUInt64LE: proto.writeBigUInt64LE,
      writeBigUInt64BE: proto.writeBigUInt64BE,
    };

    try {
      proto.readBigUInt64LE = undefined;
      proto.readBigUInt64BE = undefined;
      proto.writeBigUInt64LE = undefined;
      proto.writeBigUInt64BE = undefined;

      const mod = await import("./index.js");
      const value = BigInt("0x1234567890abcdef1234567890abcdef");

      const be = mod.toBufferBE(value, 16);
      const le = mod.toBufferLE(value, 16);

      expect(mod.toBigIntBE(be)).toBe(value);
      expect(mod.toBigIntLE(le)).toBe(value);
      expect(mod.isNative).toBe(false);
    } finally {
      restoreBufferProto(original);
    }
  });
});

