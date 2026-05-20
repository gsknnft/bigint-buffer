import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.unmock("../src/converter");
});

describe("root validateBigIntBuffer catch path", () => {
  it("returns false when converter.toBigInt throws", async () => {
    vi.doMock("../src/converter", () => ({
      IS_BROWSER: false,
      loadNative: () => ({
        toBigInt: () => {
          throw new Error("simulated converter failure");
        },
        fromBigInt: () => Buffer.alloc(0),
      }),
    }));

    const mod = await import("../src/index.js");
    expect(mod.validateBigIntBuffer()).toBe(false);
  });
});
