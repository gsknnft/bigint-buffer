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

describe("index runtime branch coverage", () => {
  it("exercises manual 64-bit fallback paths in main entrypoint", async () => {
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
      const mod = await import("./index.js");
      const value = BigInt("0xabcdef0123456789fedcba987654321");
      const width = 16;

      const be = mod.toBufferBE(value, width);
      const le = mod.toBufferLE(value, width);
      expect(mod.toBigIntBE(be)).toBe(value);
      expect(mod.toBigIntLE(le)).toBe(value);
    } finally {
      restoreBufferProto(original);
    }
  });

  it("exercises browser detection branch in main entrypoint", async () => {
    (globalThis as { document?: unknown }).document = {};
    vi.resetModules();

    const mod = await import("./index.js");
    const b64 = mod.bigintToBase64(42n);
    expect(mod.base64ToBigint(b64)).toBe(42n);
  });
});

