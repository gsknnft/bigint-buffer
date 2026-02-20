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
  delete (globalThis as { document?: unknown }).document;
  vi.resetModules();
});

describe("runtime branch coverage", () => {
  it("uses manual 64-bit fallback code paths when Buffer helpers are unavailable", async () => {
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

      vi.resetModules();
      const mod = await import("../src/ts/index");
      const value = BigInt("0x112233445566778899aabbccddeeff");

      const be = mod.toBufferBE(value, 15);
      const le = mod.toBufferLE(value, 15);

      expect(mod.toBigIntBE(be)).to.equal(value);
      expect(mod.toBigIntLE(le)).to.equal(value);
    } finally {
      restoreBufferProto(original);
    }
  });

  it("executes browser-oriented branches when document is present", async () => {
    (globalThis as { document?: unknown }).document = {};
    vi.resetModules();

    const mod = await import("../src/ts/index");
    const textBuf = mod.textToBuf("abc");

    expect(textBuf instanceof ArrayBuffer).to.equal(true);
    expect(mod.bufToText(new Uint8Array([97, 98, 99]))).to.equal("abc");
    expect(mod.bufToHex(new Uint8Array([0xde, 0xad]), true)).to.equal("0xdead");
    expect(mod.hexToBuf("dead", true) instanceof ArrayBuffer).to.equal(true);
  });
});

