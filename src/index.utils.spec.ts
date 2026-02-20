import { describe, expect, it } from "vitest";
import {
  base64ToBigint,
  bigintToBase64,
  bigintToBuf,
  bigintToHex,
  bigintToText,
  bufToBigint,
  hexToBigint,
  textToBigint,
  toBigIntBE,
  toBufferBE,
  toBufferLE,
  validateBigIntBuffer,
} from "./index.js";

describe("index utility helpers", () => {
  it("throws on negative widths for toBufferLE/toBufferBE", () => {
    expect(() => toBufferLE(1n, -1)).toThrow("toBufferLE width must be a non-negative integer");
    expect(() => toBufferBE(1n, -1)).toThrow("toBufferBE width must be a non-negative integer");
  });

  it("throws on non-integer widths", () => {
    expect(() => toBufferLE(1n, 1.5)).toThrow("toBufferLE width must be a non-negative integer");
    expect(() => toBufferBE(1n, Number.NaN)).toThrow("toBufferBE width must be a non-negative integer");
  });

  it("converts bigint to minimal big-endian buffer", () => {
    expect(bigintToBuf(0n)).toEqual(Buffer.from([0]));
    expect(bigintToBuf(0xdeadbeefn)).toEqual(Buffer.from("deadbeef", "hex"));
  });

  it("throws on negative bigint input where unsupported", () => {
    expect(() => bigintToBuf(-1n)).toThrow("bigintToBuf: negative bigint values are not supported");
    expect(() => bigintToHex(-1n)).toThrow("bigintToHex: negative bigint values are not supported");
    expect(() => bigintToBase64(-1n)).toThrow("bigintToBase64: negative bigint values are not supported");
  });

  it("supports hex conversion edge cases", () => {
    expect(bigintToHex(0n)).toBe("00");
    expect(bigintToHex(0xfn)).toBe("0f");
    expect(hexToBigint("")).toBe(0n);
    expect(hexToBigint("0x2a")).toBe(42n);
    expect(hexToBigint("2a")).toBe(42n);
  });

  it("supports decimal text conversion and validation", () => {
    expect(bigintToText(123456n)).toBe("123456");
    expect(textToBigint("42")).toBe(42n);
    expect(() => textToBigint("")).toThrow("textToBigint: input string cannot be empty");
    expect(() => textToBigint("not-a-number")).toThrow("textToBigint: invalid decimal string");
  });

  it("supports base64 conversion and validation", () => {
    const encoded = bigintToBase64(123456789n);
    expect(base64ToBigint(encoded)).toBe(123456789n);
    expect(base64ToBigint(`  ${encoded}  `)).toBe(123456789n);
    expect(base64ToBigint("B1vNFQ==".replace(/\+/g, "-").replace(/\//g, "_"))).toBe(
      base64ToBigint("B1vNFQ==")
    );
    expect(() => base64ToBigint("")).toThrow("base64ToBigint: input string cannot be empty");
    expect(() => base64ToBigint("**invalid**")).toThrow("base64ToBigint: invalid base64 string format");
  });

  it("round-trips through buffer helpers", () => {
    const value = 0x1234_5678_9abc_def0n;
    const be = toBufferBE(value, 8);
    expect(toBigIntBE(be)).toBe(value);
    expect(bufToBigint(Buffer.from("0102", "hex"))).toBe(0x0102n);
  });

  it("accepts Uint8Array and ArrayBuffer byte inputs", () => {
    const bytes = Uint8Array.from([0xde, 0xad, 0xbe, 0xef]);
    expect(toBigIntBE(bytes)).toBe(0xdeadbeefn);
    expect(bufToBigint(bytes.buffer)).toBe(0xdeadbeefn);
  });

  it("validates converter wiring", () => {
    expect(validateBigIntBuffer()).toBe(true);
  });
});
