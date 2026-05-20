import { describe, expect, it } from "vitest";
import { resolveBindings } from "../../src/converter.js";

describe("resolveBindings shape detection", () => {
  it("returns a function as-is", () => {
    const fn = () => undefined;
    expect(resolveBindings(fn)).toBe(fn);
  });

  it("unwraps a `{ default: fn }` ESM-interop shape", () => {
    const fn = () => undefined;
    expect(resolveBindings({ default: fn })).toBe(fn);
  });

  it("unwraps a `{ default: { default: fn } }` double-interop shape", () => {
    const fn = () => undefined;
    expect(resolveBindings({ default: { default: fn } })).toBe(fn);
  });

  it("throws TypeError on an unrecognized shape", () => {
    expect(() => resolveBindings(undefined)).toThrow(TypeError);
    expect(() => resolveBindings(null)).toThrow(TypeError);
    expect(() => resolveBindings({})).toThrow(TypeError);
    expect(() => resolveBindings({ default: 42 })).toThrow(TypeError);
    expect(() => resolveBindings({ default: { default: 42 } })).toThrow(TypeError);
    expect(() => resolveBindings(42)).toThrow(TypeError);
  });
});
