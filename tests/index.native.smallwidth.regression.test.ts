import { beforeAll, describe, expect, it } from "vitest";

let lib: Awaited<typeof import("../src/index.js")>;

beforeAll(async () => {
  lib = await import("../src/index.js");
});

describe("native regression: small-width big-endian writes", () => {
  it("writes exact bytes for width=3 and width=5 (native path)", () => {
    if (!lib.isNative) return;

    const v3 = 0x010203n;
    const v5 = 0x0102030405n;

    const b3 = lib.toBufferBE(v3, 3);
    const b5 = lib.toBufferBE(v5, 5);

    expect(b3.toString("hex")).toBe("010203");
    expect(b5.toString("hex")).toBe("0102030405");

    expect(lib.toBigIntBE(b3)).toBe(v3);
    expect(lib.toBigIntBE(b5)).toBe(v5);
  });

  it("writes exact bytes via toBufferBEInto for width=3 and width=5 (native path)", () => {
    if (!lib.isNative) return;

    const target = Buffer.alloc(12, 0xaa);

    const w3 = lib.toBufferBEInto(0x010203n, 3, target, 2);
    const w5 = lib.toBufferBEInto(0x0102030405n, 5, target, 6);

    expect(w3).toBe(3);
    expect(w5).toBe(5);

    expect(target.subarray(2, 5).toString("hex")).toBe("010203");
    expect(target.subarray(6, 11).toString("hex")).toBe("0102030405");

    // Ensure neighbors remain untouched.
    expect(target[1]).toBe(0xaa);
    expect(target[5]).toBe(0xaa);
    expect(target[11]).toBe(0xaa);
  });
});

