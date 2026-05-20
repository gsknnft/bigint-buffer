import { describe, expect, it } from "vitest";
import * as conversion from "../../src/conversion.js";
import * as converter from "../../src/converter.js";
import * as root from "../../src/index.js";

describe("entrypoint exports after flatten", () => {
  it("conversion module exposes the historical API", () => {
    expect(typeof conversion.toBigIntBE).toBe("function");
    expect(typeof conversion.toBufferLE).toBe("function");
    expect(typeof conversion.bigintToBuf).toBe("function");
    expect(typeof conversion.bigintToHex).toBe("function");
    expect(typeof conversion.bigintToBase64).toBe("function");
    expect(typeof conversion.bigintToText).toBe("function");
    expect(typeof conversion.fixedPointToBigInt).toBe("function");
  });

  it("converter module exposes the native loader surface", () => {
    expect(typeof converter.findModuleRoot).toBe("function");
    expect(typeof converter.loadNative).toBe("function");
    expect(typeof converter.IS_BROWSER).toBe("boolean");
  });

  it("root module re-exports fixed-point helpers", () => {
    expect(typeof root.toFixedPoint).toBe("function");
    expect(typeof root.fromFixedPoint).toBe("function");
    expect(typeof root.toBigIntValue).toBe("function");
  });

  it("findModuleRoot is callable", () => {
    const r = converter.findModuleRoot();
    expect(r === undefined || typeof r === "string").toBe(true);
  });
});
