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
  vi.unmock("../src/converter");
});

describe("top-level manual fallback branches", () => {
  it("uses pure JS fallback with manual 64-bit code paths when native is unavailable", async () => {
    vi.doMock("../src/converter", () => ({
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

      const mod = await import("../src/index.js");
      const value = BigInt("0x1234567890abcdef1234567890abcdef");

      const be = mod.toBufferBE(value, 16);
      const le = mod.toBufferLE(value, 16);

      expect(mod.toBigIntBE(be)).toBe(value);
      expect(mod.toBigIntLE(le)).toBe(value);
      expect(mod.isNative).toBe(false);

      // Non-8-multiple widths exercise the tail-byte loops in both
      // writeBigIntToBuffer{BE,LE}; the chunk loop never covers them.
      const tail = BigInt("0x11223344556677");
      expect(mod.toBufferBE(tail, 7).toString("hex")).toBe("11223344556677");
      expect(mod.toBufferLE(tail, 7).toString("hex")).toBe("77665544332211");
      expect(mod.toBigIntBE(mod.toBufferBE(tail, 9))).toBe(tail);
      expect(mod.toBigIntLE(mod.toBufferLE(tail, 9))).toBe(tail);

      // Same for the bigint-from-buffer tail reads in
      // bufferToBigInt{BE,LE} — these only run when len & 7 !== 0.
      const buf7 = Buffer.from("11223344556677", "hex");
      expect(mod.toBigIntBE(buf7)).toBe(tail);
      expect(mod.toBigIntLE(Buffer.from("77665544332211", "hex"))).toBe(tail);
    } finally {
      restoreBufferProto(original);
    }
  });
});

