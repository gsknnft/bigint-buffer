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
  vi.unmock("../src/ts/converter");
});

describe("conversion manual fallback branches", () => {
  it("uses pure JS converter when loadNative returns undefined", async () => {
    vi.doMock("../src/ts/converter", () => ({
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

      const mod = await import("../src/ts/index");
      const value = BigInt("0xabcdef1234567890abcdef1234567890");

      const be = mod.toBufferBE(value, 16);
      const le = mod.toBufferLE(value, 16);

      expect(mod.toBigIntBE(be)).toEqual(value);
      expect(mod.toBigIntLE(le)).toEqual(value);
    } finally {
      restoreBufferProto(original);
    }
  });
});

