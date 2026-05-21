import { afterEach, describe, expect, it, vi } from "vitest";
vi.unmock("../../src/converter.js");
import {
  averageFixedPoint,
  base64ToBigint,
  bigintToBase64,
  bufToHex,
  bufToText,
  fixedPointToBigInt,
  toBigIntValue,
  ZERO_FIXED_POINT,
} from "../../src/conversion.js";

afterEach(() => {
  vi.resetModules();
});

describe("conversion error & edge branches", () => {
  it("bufToText rejects unsupported input types", () => {
    // @ts-expect-error - deliberately invalid input
    expect(() => bufToText(42)).toThrow(TypeError);
  });

  it("bufToHex handles a plain ArrayBuffer (non-view) input", () => {
    const view = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const ab: ArrayBuffer = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
    expect(bufToHex(ab)).toBe("deadbeef");
  });

  it("bigintToBase64 rejects negative bigints", () => {
    expect(() => bigintToBase64(-1n)).toThrow(/negative bigint/);
  });

  it("base64ToBigint short-circuits on empty / whitespace input", () => {
    expect(base64ToBigint("")).toBe(0n);
    expect(base64ToBigint("   ")).toBe(0n);
  });

  it("base64ToBigint rejects invalid characters", () => {
    expect(() => base64ToBigint("!!!")).toThrow(/invalid base64/);
  });

  it("toBigIntValue short-circuits on undefined / empty / whitespace-only", () => {
    expect(toBigIntValue(undefined)).toBe(0n);
    expect(toBigIntValue("")).toBe(0n);
    expect(toBigIntValue("   ")).toBe(0n);
  });

  it("averageFixedPoint returns ZERO for an empty array", () => {
    expect(averageFixedPoint([])).toBe(ZERO_FIXED_POINT);
  });

  it("fixedPointToBigInt delegates to toBigIntValue", () => {
    expect(fixedPointToBigInt()).toBe(0n);
    expect(fixedPointToBigInt("0x10")).toBe(16n);
  });
});

describe("validateBigIntBuffer catch path", () => {
  it("returns false when the underlying converter throws", async () => {
    vi.doMock("../../src/converter.js", () => ({
      IS_BROWSER: false,
      loadNative: () => ({
        toBigInt: () => {
          throw new Error("simulated converter failure");
        },
        fromBigInt: () => Buffer.alloc(0),
      }),
    }));

    const mod = await import("../../src/conversion.js");
    expect(mod.validateBigIntBuffer()).toBe(false);
  });
});
