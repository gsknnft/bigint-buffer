import { bigintToHex, hexToBigint } from "../index";

export type FixedPoint = string;

export const FIXED_POINT_DECIMALS = 9;
export const FIXED_POINT_PATTERN = /^-?0x[0-9a-f]+$/i;
export const ZERO_FIXED_POINT: FixedPoint = '0x0';

const normalizeHex = (value: string): string =>
  value.startsWith('0x') || value.startsWith('0X') ? value : `0x${value}`;

const toHexString = (value: bigint): FixedPoint => {
  if (value === 0n) {
    return ZERO_FIXED_POINT;
  }
  const isNegative = value < 0n;
  const absValue = isNegative ? -value : value;
  const hexValue = bigintToHex(absValue);
  return `${isNegative ? '-' : ''}0x${hexValue}`;
};

export const toBigIntValue = (value?: FixedPoint): bigint => {
  if (!value) {
    return 0n;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 0n;
  }
  const isNegative = trimmed.startsWith('-');
  const body = isNegative ? trimmed.slice(1) : trimmed;
  const normalized = normalizeHex(body);
  const bigValue = hexToBigint(normalized);
  return isNegative ? -bigValue : bigValue;
};

export function toFixedPoint(
  value: number,
  decimals: number = FIXED_POINT_DECIMALS,
): FixedPoint {
  if (!Number.isFinite(value)) {
    return ZERO_FIXED_POINT;
  }
  const scale = Math.pow(10, decimals);
  const scaled = BigInt(Math.round(value * scale));
  return toHexString(scaled);
}

export function fromFixedPoint(
  value?: FixedPoint,
  decimals: number = FIXED_POINT_DECIMALS,
): number {
  const bigValue = toBigIntValue(value);
  if (bigValue === 0n) {
    return 0;
  }
  const scale = Math.pow(10, decimals);
  return Number(bigValue) / scale;
}

export function addFixedPoint(a: FixedPoint, b: FixedPoint): FixedPoint {
  return toHexString(toBigIntValue(a) + toBigIntValue(b));
}

export function subtractFixedPoint(a: FixedPoint, b: FixedPoint): FixedPoint {
  return toHexString(toBigIntValue(a) - toBigIntValue(b));
}

export function averageFixedPoint(values: FixedPoint[]): FixedPoint {
  if (values.length === 0) {
    return ZERO_FIXED_POINT;
  }
  const sum = values.reduce((acc, value) => acc + toBigIntValue(value), 0n);
  return toHexString(sum / BigInt(values.length));
}

export function compareFixedPoint(a: FixedPoint, b: FixedPoint): number {
  const diff = toBigIntValue(a) - toBigIntValue(b);
  if (diff === 0n) {
    return 0;
  }
  return diff > 0n ? 1 : -1;
}

export function fixedPointToBigInt(value?: FixedPoint): bigint {
  return toBigIntValue(value);
}
