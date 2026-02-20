import * as bc from "#pkg";
import { describe, expect, it } from "vitest";

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
        const be = bc.toBufferBE(value, width);
        const le = bc.toBufferLE(value, width);
        const mask = (1n << BigInt(width * 8)) - 1n;
        const expected = value & mask;
        expect(bc.toBigIntBE(be)).to.equal(expected);
        expect(bc.toBigIntLE(le)).to.equal(expected);
      }
    }
  });

  it("throws for negative width", () => {
    expect(() => bc.toBufferBE(1n, -1)).to.throw(RangeError);
    expect(() => bc.toBufferLE(1n, -1)).to.throw(RangeError);
  });

  it("validates converter behavior", () => {
    expect(bc.validateBigIntBuffer()).to.equal(true);
  });

  it("accepts Uint8Array and ArrayBuffer as byte input", () => {
    const bytes = Uint8Array.from([0xde, 0xad, 0xbe, 0xef]);
    expect(bc.toBigIntBE(bytes)).to.equal(0xdeadbeefn);
    expect(bc.toBigIntLE(bytes.buffer)).to.equal(0xefbeadden);
  });
});
