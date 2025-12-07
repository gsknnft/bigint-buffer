import { describe, it, expect } from "vitest";
import { addFixedPoint, averageFixedPoint, compareFixedPoint, fromFixedPoint, subtractFixedPoint, toFixedPoint, ZERO_FIXED_POINT } from "../src/ts/index";

describe("FixedPointClass", () => {
  it("converts number to fixed point and back", () => {
    const val = 123.456789;
    const fp = toFixedPoint(val);
    const back = fromFixedPoint(fp);
    expect(back).toBeCloseTo(val, 6); // allow rounding tolerance
  });

  it("handles zero correctly", () => {
    expect(toFixedPoint(0)).toBe(ZERO_FIXED_POINT);
    expect(fromFixedPoint(ZERO_FIXED_POINT)).toBe(0);
  });

  it("adds two fixed points", () => {
    const a = toFixedPoint(1.5);
    const b = toFixedPoint(2.25);
    const sum = addFixedPoint(a, b);
    expect(fromFixedPoint(sum)).toBeCloseTo(3.75, 6);
  });

  it("subtracts two fixed points", () => {
    const a = toFixedPoint(5);
    const b = toFixedPoint(2);
    const diff = subtractFixedPoint(a, b);
    expect(fromFixedPoint(diff)).toBeCloseTo(3, 6);
  });

  it("averages multiple fixed points", () => {
    const values = [1, 2, 3].map(v => toFixedPoint(v));
    const avg = averageFixedPoint(values);
    expect(fromFixedPoint(avg)).toBeCloseTo(2, 6);
  });

  it("compares fixed points", () => {
    const a = toFixedPoint(10);
    const b = toFixedPoint(20);
    expect(compareFixedPoint(a, b)).toBe(-1);
    expect(compareFixedPoint(b, a)).toBe(1);
    expect(compareFixedPoint(a, a)).toBe(0);
  });

  it("parses negative values", () => {
    const neg = toFixedPoint(-42.123456);
    expect(fromFixedPoint(neg)).toBeCloseTo(-42.123456, 6);
  });

  it("handles invalid input gracefully", () => {
    expect(fromFixedPoint("")).toBe(0);
    expect(fromFixedPoint(undefined)).toBe(0);
    expect(toFixedPoint(NaN)).toBe(ZERO_FIXED_POINT);
  });
});