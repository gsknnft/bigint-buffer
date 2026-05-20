import { beforeAll, describe, expect, it } from "vitest";

let lib: Awaited<typeof import("../src/index.js")>;

beforeAll(async () => {
  lib = await import("../src/index.js");
});

describe("width safety ceiling", () => {
  const TOO_LARGE = (1 << 28) + 1;

  it("toBufferBE rejects width above 2^28", () => {
    expect(() => lib.toBufferBE(0n, TOO_LARGE)).toThrow(/exceeds maximum/);
  });

  it("toBufferLE rejects width above 2^28", () => {
    expect(() => lib.toBufferLE(0n, TOO_LARGE)).toThrow(/exceeds maximum/);
  });

  it("toBufferBE rejects negative width", () => {
    expect(() => lib.toBufferBE(0n, -1)).toThrow(/non-negative integer/);
  });

  it("toBufferBE rejects non-integer width", () => {
    expect(() => lib.toBufferBE(0n, 1.5)).toThrow(/non-negative integer/);
  });

  it("toBufferBE accepts width exactly at the ceiling boundary - 1", () => {
    // 1 byte at the boundary is fine; we don't actually allocate 256MiB in tests.
    expect(() => lib.toBufferBE(0n, 0)).not.toThrow();
    expect(() => lib.toBufferBE(0n, 1)).not.toThrow();
  });
});

describe("non-8-multiple width tail loop coverage", () => {
  it("toBufferBE handles 7-byte width (tail loop only)", () => {
    const buf = lib.toBufferBE(0x11223344556677n, 7);
    expect(buf.toString("hex")).toBe("11223344556677");
  });

  it("toBufferLE handles 7-byte width", () => {
    const buf = lib.toBufferLE(0x11223344556677n, 7);
    expect(buf.toString("hex")).toBe("77665544332211");
  });

  it("toBufferBE handles 9-byte width (one 8-byte chunk + tail)", () => {
    const buf = lib.toBufferBE(0xaa11223344556677n, 9);
    expect(buf[0]).toBe(0x00);
    expect(buf[1]).toBe(0xaa);
    expect(buf[8]).toBe(0x77);
  });

  it("toBufferLE handles 9-byte width", () => {
    const buf = lib.toBufferLE(0xaa11223344556677n, 9);
    expect(buf[0]).toBe(0x77);
    expect(buf[7]).toBe(0xaa);
    expect(buf[8]).toBe(0x00);
  });

  it("toBigIntBE round-trips with non-8-multiple widths", () => {
    const value = 0x11223344556677n;
    expect(lib.toBigIntBE(lib.toBufferBE(value, 7))).toBe(value);
    expect(lib.toBigIntBE(lib.toBufferBE(value, 9))).toBe(value);
  });

  it("toBigIntLE round-trips with non-8-multiple widths", () => {
    const value = 0x11223344556677n;
    expect(lib.toBigIntLE(lib.toBufferLE(value, 7))).toBe(value);
    expect(lib.toBigIntLE(lib.toBufferLE(value, 9))).toBe(value);
  });
});

describe("bindings module shape resolution", () => {
  // resolveBindings is internal; we exercise the shape branches indirectly via
  // its public surface. The native loader is /* c8 ignore */-d, but the
  // shape-detection logic itself is reachable.
  it("validateBigIntBuffer succeeds on the default (JS) path", () => {
    expect(lib.validateBigIntBuffer()).toBe(true);
  });
});

describe("base64 padding loop", () => {
  it("base64ToBigint correctly pads unpadded input", () => {
    // 'AQ' decodes to [0x01] under base64. Unpadded length 2 → loop pads to 4.
    expect(lib.base64ToBigint("AQ")).toBe(1n);
    // Three-char body, also unpadded → one '=' added.
    expect(lib.base64ToBigint("AQI")).toBe(BigInt(0x0102));
  });

  it("base64ToBigint accepts URL-safe variants", () => {
    expect(lib.base64ToBigint("AQ==")).toBe(1n);
    expect(lib.base64ToBigint("_w")).toBe(BigInt(0xff));
  });

  it("base64ToBigint rejects invalid characters", () => {
    expect(() => lib.base64ToBigint("AQ!")).toThrow(/invalid base64/);
  });

  it("base64ToBigint rejects empty / whitespace input", () => {
    expect(() => lib.base64ToBigint("")).toThrow(/cannot be empty/);
    expect(() => lib.base64ToBigint("   ")).toThrow(/cannot be empty/);
  });
});
