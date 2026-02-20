// Export robust Buffer/BigInt methods at top level
export {
  FIXED_POINT_DECIMALS,
  FIXED_POINT_PATTERN,
  ZERO_FIXED_POINT,
  toFixedPoint,
  fromFixedPoint,
  addFixedPoint,
  subtractFixedPoint,
  averageFixedPoint,
  compareFixedPoint,
  fixedPointToBigInt,
  toBigIntValue,
} from "./conversion/src/ts/index";
import {
  IS_BROWSER,
  loadNative,
  type ConverterInterface,
} from "./conversion/src/ts/converter";

type ByteInput = Buffer | Uint8Array | ArrayBuffer;

type ReadUint64 = (buf: Buffer, offset: number) => bigint;
type WriteUint64 = (buf: Buffer, offset: number, value: bigint) => void;

const hasRead64LE = typeof Buffer.prototype.readBigUInt64LE === "function";
const hasRead64BE = typeof Buffer.prototype.readBigUInt64BE === "function";
const hasWrite64LE = typeof Buffer.prototype.writeBigUInt64LE === "function";
const hasWrite64BE = typeof Buffer.prototype.writeBigUInt64BE === "function";

const read64LE: ReadUint64 = hasRead64LE
  ? (buf, offset) => buf.readBigUInt64LE(offset)
  : (buf, offset) => {
      let out = 0n;
      for (let i = 7; i >= 0; i--) {
        out = (out << 8n) + BigInt(buf[offset + i]);
      }
      return out;
    };

const read64BE: ReadUint64 = hasRead64BE
  ? (buf, offset) => buf.readBigUInt64BE(offset)
  : (buf, offset) => {
      let out = 0n;
      for (let i = 0; i < 8; i++) {
        out = (out << 8n) + BigInt(buf[offset + i]);
      }
      return out;
    };

const write64LE: WriteUint64 = hasWrite64LE
  ? (buf, offset, value) => {
      buf.writeBigUInt64LE(value, offset);
    }
  : (buf, offset, value) => {
      let temp = value;
      for (let i = 0; i < 8; i++) {
        buf[offset + i] = Number(temp & 0xffn);
        temp >>= 8n;
      }
    };

const write64BE: WriteUint64 = hasWrite64BE
  ? (buf, offset, value) => {
      buf.writeBigUInt64BE(value, offset);
    }
  : (buf, offset, value) => {
      let temp = value;
      for (let i = 7; i >= 0; i--) {
        buf[offset + i] = Number(temp & 0xffn);
        temp >>= 8n;
      }
    };

const bufferToBigIntLE = (buf: Buffer): bigint => {
  let result = 0n;
  let multiplier = 1n;
  const len = buf.length;
  const remainder = len & 7;

  for (let i = 0; i < remainder; i++) {
    result += BigInt(buf[i]) * multiplier;
    multiplier <<= 8n;
  }

  for (let offset = remainder; offset < len; offset += 8) {
    const chunk = read64LE(buf, offset);
    result += chunk * multiplier;
    multiplier <<= 64n;
  }

  return result;
};

const bufferToBigIntBE = (buf: Buffer): bigint => {
  const len = buf.length;
  if (len === 0) return 0n;

  let result = 0n;
  const remainder = len & 7;
  let offset = 0;

  if (remainder !== 0) {
    for (; offset < remainder; offset++) {
      result = (result << 8n) + BigInt(buf[offset]);
    }
  }

  for (; offset < len; offset += 8) {
    const chunk = read64BE(buf, offset);
    result = (result << 64n) + chunk;
  }

  return result;
};

const writeBigIntToBufferLE = (num: bigint, target: Buffer): Buffer => {
  const width = target.length;
  let remaining = num;
  let offset = 0;

  const limit = width - (width % 8);
  for (; offset < limit; offset += 8) {
    write64LE(target, offset, remaining & 0xffffffffffffffffn);
    remaining >>= 64n;
  }

  for (; offset < width; offset++) {
    target[offset] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }

  return target;
};

const writeBigIntToBufferBE = (num: bigint, target: Buffer): Buffer => {
  const width = target.length;
  let remaining = num;
  let offset = width;

  const limit = width & ~7;
  while (offset > limit) {
    offset--;
    target[offset] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }

  for (; offset > 0; offset -= 8) {
    const chunk = remaining & 0xffffffffffffffffn;
    write64BE(target, offset - 8, chunk);
    remaining >>= 64n;
  }

  return target;
};

const byteLengthFromBigint = (value: bigint): number => {
  if (value === 0n) return 1;
  let tmp = value;
  let bytes = 0;
  while (tmp > 0n) {
    bytes++;
    tmp >>= 8n;
  }
  return bytes;
};

const assertWidth = (width: number, fnName: string): void => {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError(`${fnName} width must be a non-negative integer`);
  }
};

const toBufferInput = (input: ByteInput): Buffer => {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  }
  return Buffer.from(input);
};

const jsConverter: ConverterInterface = {
  toBigInt: (buf: Buffer, bigEndian = true) =>
    bigEndian ? bufferToBigIntBE(buf) : bufferToBigIntLE(buf),
  fromBigInt: (num: bigint, buf: Buffer, bigEndian = true) =>
    bigEndian
      ? writeBigIntToBufferBE(num, buf)
      : writeBigIntToBufferLE(num, buf),
};

let converter: ConverterInterface = jsConverter;
export let isNative = false;

if (!IS_BROWSER) {
  const nativeConverter = loadNative();
  if (nativeConverter !== undefined) {
    converter = nativeConverter;
    isNative = true;
  }
}

/**
 * Convert a little-endian buffer into a BigInt.
 * @param buf The little-endian buffer to convert
 * @returns A BigInt with the little-endian representation of buf.
 */
export function toBigIntLE(buf: ByteInput): bigint {
  return converter.toBigInt(toBufferInput(buf), false);
}

export function validateBigIntBuffer(): boolean {
  try {
    const test = toBigIntLE(Buffer.from([0x01, 0x00]));
    return test === BigInt(1);
  } catch {
    return false;
  }
}

/**
 * Convert a big-endian buffer into a BigInt
 * @param buf The big-endian buffer to convert.
 * @returns A BigInt with the big-endian representation of buf.
 */
export function toBigIntBE(buf: ByteInput): bigint {
  return converter.toBigInt(toBufferInput(buf), true);
}

/**
 * Convert a BigInt to a little-endian buffer.
 * @param num   The BigInt to convert.
 * @param width The number of bytes that the resulting buffer should be.
 * @returns A little-endian buffer representation of num.
 */
export function toBufferLE(num: bigint, width: number): Buffer {
  assertWidth(width, "toBufferLE");
  const target = width === 0 ? Buffer.alloc(0) : Buffer.allocUnsafe(width);
  return converter.fromBigInt(num, target, false);
}

/**
 * Convert a BigInt to a big-endian buffer.
 * @param num   The BigInt to convert.
 * @param width The number of bytes that the resulting buffer should be.
 * @returns A big-endian buffer representation of num.
 */
export function toBufferBE(num: bigint, width: number): Buffer {
  assertWidth(width, "toBufferBE");
  const target = width === 0 ? Buffer.alloc(0) : Buffer.allocUnsafe(width);
  return converter.fromBigInt(num, target, true);
}

// ========== Conversion Utilities ==========

/**
 * Convert a bigint to a Buffer with automatic sizing.
 * Uses big-endian encoding and calculates the minimum buffer size needed.
 * @param num The bigint to convert
 * @returns A big-endian Buffer representation
 */
export function bigintToBuf(num: bigint): Buffer {
  if (num < BigInt(0)) {
    throw new Error("bigintToBuf: negative bigint values are not supported");
  }
  const width = byteLengthFromBigint(num);
  return toBufferBE(num, width);
}

/**
 * Convert a Buffer to a bigint.
 * Assumes big-endian encoding.
 * @param buf The buffer to convert
 * @returns A bigint representation of the buffer
 */
export function bufToBigint(buf: ByteInput): bigint {
  return toBigIntBE(buf);
}

/**
 * Convert a bigint to a hexadecimal string.
 * @param num The bigint to convert
 * @returns A hexadecimal string (without '0x' prefix)
 */
export function bigintToHex(num: bigint): string {
  if (num < BigInt(0)) {
    throw new Error("bigintToHex: negative bigint values are not supported");
  }
  const hex = num.toString(16);
  // Ensure even length for proper byte representation
  return hex.length % 2 === 0 ? hex : "0" + hex;
}

/**
 * Convert a hexadecimal string to a bigint.
 * @param hex The hexadecimal string (with or without '0x' prefix)
 * @returns A bigint representation
 */
export function hexToBigint(hex: string): bigint {
  // Remove '0x' prefix if present
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (cleanHex.length === 0) {
    return BigInt(0);
  }
  return BigInt(`0x${cleanHex}`);
}

/**
 * Convert a bigint to a decimal text string.
 * @param num The bigint to convert
 * @returns A decimal string representation
 */
export function bigintToText(num: bigint): string {
  return num.toString(10);
}

/**
 * Convert a decimal text string to a bigint.
 * @param text The decimal string to convert
 * @returns A bigint representation
 */
export function textToBigint(text: string): bigint {
  if (!text?.trim()) {
    throw new Error("textToBigint: input string cannot be empty");
  }
  try {
    return BigInt(text);
  } catch (e) {
    throw new Error(
      `textToBigint: invalid decimal string "${text}" ${e instanceof Error ? e.message : String(e)}`
    );
  }
}

/**
 * Convert a bigint to a base64 string.
 * @param num The bigint to convert
 * @returns A base64 string representation
 */
export function bigintToBase64(num: bigint): string {
  if (num < BigInt(0)) {
    throw new Error("bigintToBase64: negative bigint values are not supported");
  }
  const buf = bigintToBuf(num);
  return buf.toString("base64");
}

/**
 * Convert a base64 string to a bigint.
 * @param base64 The base64 string to convert
 * @returns A bigint representation
 */
export function base64ToBigint(base64: string): bigint {
  if (!base64?.trim()) {
    throw new Error("base64ToBigint: input string cannot be empty");
  }
  // Accept both standard and URL-safe base64 variants.
  const cleaned = base64.trim();
  if (!/^[A-Za-z0-9+/=_-]+$/.test(cleaned)) {
    throw new Error("base64ToBigint: invalid base64 string format");
  }
  let normalized = cleaned.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4 !== 0) {
    normalized += "=";
  }
  const buf = Buffer.from(normalized, "base64");
  return bufToBigint(buf);
}

