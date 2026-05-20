import { describe, expect, it } from "vitest";
import { toBufferBE, toBufferLE, toBigIntBE, toBigIntLE, validateBigIntBuffer } from "../../src/conversion";

describe("core endian conversion helpers", () => {
  it("round-trips BE and LE across mixed sizes", () => {
    const values = [
      0n,
      1n,
      0x7fn,
      0x80n,
      0xdeadbeefn,
      BigInt("0x1234567890abcdef1234567890abcdef"),
    ];
    const widths = [1, 2, 4, 8, 16, 24];

    for (const value of values) {
      for (const width of widths) {
        const be = toBufferBE(value, width);
        const le = toBufferLE(value, width);
        const mask = (1n << BigInt(width * 8)) - 1n;
        const expected = value & mask;
        expect(toBigIntBE(be)).to.equal(expected);
        expect(toBigIntLE(le)).to.equal(expected);
      }
    }
  });

  it("throws for negative width", () => {
    expect(() => toBufferBE(1n, -1)).to.throw(RangeError);
    expect(() => toBufferLE(1n, -1)).to.throw(RangeError);
  });

  it("validates converter behavior", () => {
    expect(validateBigIntBuffer()).to.equal(true);
  });

  it("accepts Uint8Array and ArrayBuffer as byte input", () => {
    const bytes = Uint8Array.from([0xde, 0xad, 0xbe, 0xef]);
    expect(toBigIntBE(bytes)).to.equal(0xdeadbeefn);
    expect(toBigIntLE(bytes.buffer)).to.equal(0xefbeadden);
  });
});
