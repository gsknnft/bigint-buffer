import { beforeAll, describe, expect, it } from "vitest";

let toBufferBE: Awaited<typeof import("../src/index.js")>["toBufferBE"];
let toBufferLE: Awaited<typeof import("../src/index.js")>["toBufferLE"];
let toBufferBEInto: Awaited<typeof import("../src/index.js")>["toBufferBEInto"];
let toBufferLEInto: Awaited<typeof import("../src/index.js")>["toBufferLEInto"];

beforeAll(async () => {
  const lib = await import("../src/index.js");
  toBufferBE = lib.toBufferBE;
  toBufferLE = lib.toBufferLE;
  toBufferBEInto = lib.toBufferBEInto;
  toBufferLEInto = lib.toBufferLEInto;
});

const VAL = 0x1122334455667788n;

describe("toBufferBEInto / toBufferLEInto", () => {
  it("writes at a non-zero offset without touching neighbors", () => {
    const scratch = Buffer.alloc(16, 0xff);
    const written = toBufferBEInto(VAL, 8, scratch, 4);

    expect(written).toBe(8);
    expect(scratch[3]).toBe(0xff);
    expect(scratch[12]).toBe(0xff);
    expect(scratch[4]).toBe(0x11);
    expect(scratch[11]).toBe(0x88);
  });

  it("accepts a Uint8Array target", () => {
    const u8 = new Uint8Array(10);
    toBufferBEInto(0xabcdn, 2, u8, 3);
    expect(u8[3]).toBe(0xab);
    expect(u8[4]).toBe(0xcd);
  });

  it("writes correctly into a Uint8Array view with non-zero byteOffset", () => {
    const backing = new Uint8Array(32);
    backing.fill(0xaa);
    const view = new Uint8Array(backing.buffer, 8, 16);
    toBufferBEInto(VAL, 8, view, 2);
    // Underlying bytes at backing[10..18) should hold the BE encoding.
    expect(backing[10]).toBe(0x11);
    expect(backing[17]).toBe(0x88);
    // Bytes outside the write window untouched.
    expect(backing[9]).toBe(0xaa);
    expect(backing[18]).toBe(0xaa);
  });

  it("throws when the write would exceed target length", () => {
    const small = Buffer.alloc(4);
    expect(() => toBufferBEInto(VAL, 8, small, 0)).toThrow(RangeError);
    expect(() => toBufferBEInto(VAL, 4, small, 1)).toThrow(RangeError);
  });

  it("throws on negative or non-integer offset", () => {
    const buf = Buffer.alloc(8);
    expect(() => toBufferBEInto(VAL, 8, buf, -1)).toThrow(RangeError);
    expect(() => toBufferBEInto(VAL, 8, buf, 1.5)).toThrow(RangeError);
  });

  it("returns 0 for width=0 and does not mutate the target", () => {
    const buf = Buffer.alloc(4, 0x55);
    expect(toBufferBEInto(VAL, 0, buf, 2)).toBe(0);
    expect(Array.from(buf)).toEqual([0x55, 0x55, 0x55, 0x55]);
  });

  it("matches toBufferBE byte-for-byte", () => {
    const expected = toBufferBE(VAL, 8);
    const target = Buffer.alloc(8);
    toBufferBEInto(VAL, 8, target, 0);
    expect(target.equals(expected)).toBe(true);
  });

  it("matches toBufferLE byte-for-byte", () => {
    const expected = toBufferLE(VAL, 8);
    const target = Buffer.alloc(8);
    toBufferLEInto(VAL, 8, target, 0);
    expect(target.equals(expected)).toBe(true);
  });

  it("rejects width above the 2^28 safety ceiling", () => {
    const buf = Buffer.alloc(8);
    expect(() => toBufferBEInto(VAL, (1 << 28) + 1, buf, 0)).toThrow(/exceeds maximum/);
    expect(() => toBufferLEInto(VAL, (1 << 28) + 1, buf, 0)).toThrow(/exceeds maximum/);
  });

  it("supports sequential streaming writes via returned bytesWritten", () => {
    const scratch = Buffer.alloc(24);
    let off = 0;
    off += toBufferBEInto(0x1111111111111111n, 8, scratch, off);
    off += toBufferBEInto(0x2222222222222222n, 8, scratch, off);
    off += toBufferBEInto(0x3333333333333333n, 8, scratch, off);
    expect(off).toBe(24);
    expect(scratch[0]).toBe(0x11);
    expect(scratch[8]).toBe(0x22);
    expect(scratch[16]).toBe(0x33);
  });
});
