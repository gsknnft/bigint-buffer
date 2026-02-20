import { ConverterInterface, IS_BROWSER, loadNative } from "./converter";

let converter: ConverterInterface | undefined;
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

const toBufferInput = (input: ByteInput): Buffer => {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  }
  return Buffer.from(input);
};

const assertWidth = (width: number, fnName: string): void => {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError(`${fnName} width must be a non-negative integer`);
  }
};
if (!IS_BROWSER) {
  converter = loadNative();
}

if (converter === undefined) {
  // fallback to pure JS if needed (browser or when native load fails)
  converter = {
    toBigInt: (buf: Buffer, bigEndian = true) =>
      bigEndian ? bufferToBigIntBE(buf) : bufferToBigIntLE(buf),
    fromBigInt: (num: bigint, buf: Buffer, bigEndian = true) =>
      bigEndian
        ? writeBigIntToBufferBE(num, buf)
        : writeBigIntToBufferLE(num, buf),
  };
}

/**
 * Convert a little-endian buffer into a BigInt.
 * @param buf The little-endian buffer to convert
 * @returns A BigInt with the little-endian representation of buf.
 */
export function toBigIntLE(buf: ByteInput): bigint {
  if (converter === undefined) return 0n;
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
  if (converter === undefined) return 0n;
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
  if (converter === undefined) return Buffer.alloc(0);
  return converter.fromBigInt(num, Buffer.allocUnsafe(width), false);
}

/**
 * Convert a BigInt to a big-endian buffer.
 * @param num   The BigInt to convert.
 * @param width The number of bytes that the resulting buffer should be.
 * @returns A big-endian buffer representation of num.
 */
export function toBufferBE(num: bigint, width: number): Buffer {
  assertWidth(width, "toBufferBE");
  if (converter === undefined) return Buffer.alloc(0);
  return converter.fromBigInt(num, Buffer.allocUnsafe(width), true);
}

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

/**
 * Parses a hexadecimal string for correctness and returns it with or without
 * '0x' prefix, and/or with the specified byte length
 * @param a - the string with an hexadecimal number to be parsed
 * @param prefix0x - set to true to prefix the output with '0x'
 * @param byteLength - pad the output to have the desired byte length. Notice
 * that the hex length is double the byte length.
 *
 * @returns
 *
 * @throws RangeError if input string does not hold an hexadecimal number
 * @throws RangeError if requested byte length is less than the input byte length
 */
export function parseHex(
  a: string,
  prefix0x = false,
  byteLength?: number
): string {
  const hexMatch = a.match(/^(0x)?([\da-fA-F]+)$/);
  if (hexMatch == null) {
    throw new RangeError(
      "input must be a hexadecimal string, e.g. '0x124fe3a' or '0214f1b2'"
    );
  }
  let hex = hexMatch[2];
  if (byteLength !== undefined) {
    if (byteLength < hex.length / 2) {
      throw new RangeError(
        `expected byte length ${byteLength} < input hex byte length ${Math.ceil(
          hex.length / 2
        )}`
      );
    }
    hex = hex.padStart(byteLength * 2, "0");
  }
  return prefix0x ? "0x" + hex : hex;
}

/**
 * Converts an arbitrary-size non-negative bigint to an ArrayBuffer or a Buffer
 * (default for Node.js)
 *
 * @param a
 * @param returnArrayBuffer - In Node.js, it forces the output to be an
 * ArrayBuffer instead of a Buffer.
 *
 * @returns an ArrayBuffer or a Buffer with a binary representation of the input
 * bigint
 *
 * @throws RangeError if a < 0.
 */
export function bigintToBuf(
  a: bigint,
  returnArrayBuffer = false
): ArrayBuffer | Buffer {
  if (a < 0) {
    throw RangeError(
      "a should be a non-negative integer. Negative values are not supported"
    );
  }
  return hexToBuf(bigintToHex(a), returnArrayBuffer);
}

/**
 * Converts an ArrayBuffer, TypedArray or Buffer (node.js) to a bigint
 * @param buf
 * @returns a bigint
 */
export function bufToBigint(buf: ArrayBuffer | TypedArray | Buffer): bigint {
  let bits = 8n;
  if (ArrayBuffer.isView(buf)) {
    bits = BigInt(buf.BYTES_PER_ELEMENT * 8);
  } else {
    buf = new Uint8Array(buf);
  }

  let ret = 0n;
  for (const i of buf.values()) {
    const bi = BigInt(i);
    ret = (ret << bits) + bi;
  }
  return ret;
}

/**
 * Converts a non-negative bigint to a hexadecimal string
 * @param a - a non negative bigint
 * @param prefix0x - set to true to prefix the output with '0x'
 * @param byteLength - pad the output to have the desired byte length. Notice
 * that the hex length is double the byte length.
 *
 * @returns hexadecimal representation of the input bigint
 *
 * @throws RangeError if a < 0
 */
export function bigintToHex(
  a: bigint,
  prefix0x = false,
  byteLength?: number
): string {
  if (a < 0) {
    throw RangeError(
      "a should be a non-negative integer. Negative values are not supported"
    );
  }
  return parseHex(a.toString(16), prefix0x, byteLength);
}

/**
 * Converts a hexadecimal string to a bigint
 *
 * @param hexStr
 *
 * @returns a bigint
 *
 * @throws RangeError if input string does not hold an hexadecimal number
 */
export function hexToBigint(hexStr: string): bigint {
  return BigInt(parseHex(hexStr, true));
}

/**
 * Converts a non-negative bigint representing a binary array of utf-8 encoded
 * text to a string of utf-8 text
 *
 * @param a - A non-negative bigint representing a binary array of utf-8 encoded
 * text.
 *
 * @returns a string text with utf-8 encoding
 *
 * @throws RangeError if a < 0.
 */
export function bigintToText(a: bigint): string {
  if (a < 0) {
    throw RangeError(
      "a should be a non-negative integer. Negative values are not supported"
    );
  }
  return bufToText(hexToBuf(a.toString(16)));
}

/**
 * Converts a utf-8 string to a bigint (from its binary representaion)
 *
 * @param text - A string text with utf-8 encoding
 *
 * @returns a bigint representing a binary array of the input utf-8 encoded text
 */
export function textToBigint(text: string): bigint {
  return hexToBigint(bufToHex(textToBuf(text)));
}
function toBuffer(input: ArrayBuffer | TypedArray | Buffer): Buffer {
  if (Buffer.isBuffer(input)) {
    return input;
  }

  if (ArrayBuffer.isView(input)) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  }

  if (input instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(input));
  }

  throw new TypeError("Unsupported input type for Buffer.from");
}
/**
 * Converts an ArrayBuffer, TypedArray or Buffer (in Node.js) containing utf-8
 * encoded text to a string of utf-8 text
 *
 * @param buf - A buffer containing utf-8 encoded text
 *
 * @returns a string text with utf-8 encoding
 */
export function bufToText(buf: ArrayBuffer | TypedArray | Buffer): string {
  const input = toBuffer(buf);
  if (IS_BROWSER) {
    return new TextDecoder().decode(new Uint8Array(input));
  } else {
    return Buffer.from(input).toString();
  }
}

/**
 * Converts a string of utf-8 encoded text to an ArrayBuffer or a Buffer
 * (default in Node.js)
 *
 * @param str - A string of text (with utf-8 encoding)
 * @param returnArrayBuffer - When invoked in Node.js, it can force the output
 * to be an ArrayBuffer instead of a Buffer.
 *
 * @returns an ArrayBuffer or a Buffer containing the utf-8 encoded text
 */
export function textToBuf(
  str: string,
  returnArrayBuffer = false
): ArrayBuffer | Buffer {
  if (!IS_BROWSER && !returnArrayBuffer) {
    return Buffer.from(new TextEncoder().encode(str).buffer);
  }
  return new TextEncoder().encode(str).buffer;
}

/**
 * Returns the hexadecimal representation of a buffer.
 *
 * @param buf
 * @param prefix0x - set to true to prefix the output with '0x'
 * @param byteLength - pad the output to have the desired byte length. Notice
 * that the hex length is double the byte length.
 *
 * @returns a string with a hexadecimal representation of the input buffer
 */
export function bufToHex(
  buf: ArrayBuffer | TypedArray | Buffer,
  prefix0x = false,
  byteLength?: number
): string {
  if (IS_BROWSER) {
    let s = "";
    const h = "0123456789abcdef";
    if (ArrayBuffer.isView(buf)) {
      buf = new Uint8Array(
        buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
      );
    } else {
      buf = new Uint8Array(buf);
    }

    (buf as Uint8Array).forEach((v) => {
      s += h[v >> 4] + h[v & 15];
    });

    return parseHex(s, prefix0x, byteLength);
  } else {
    const input = toBuffer(buf);
    if (ArrayBuffer.isView(input)) {
      buf = new Uint8Array(
        input.buffer.slice(
          input.byteOffset,
          input.byteOffset + input.byteLength
        )
      );
    }
    return parseHex(
      Buffer.from(toBuffer(buf)).toString("hex"),
      prefix0x,
      byteLength
    );
  }
}

/**
 * Converts a hexadecimal string to a buffer
 *
 * @param hexStr - A string representing a number with hexadecimal notation
 * @param returnArrayBuffer - In Node.js, it forces the output to be an
 * ArrayBuffer instead of a Buffer.
 *
 * @returns An ArrayBuffer or a Buffer
 *
 * @throws RangeError if input string does not hold an hexadecimal number
 */
export function hexToBuf(
  hexStr: string,
  returnArrayBuffer = false
): ArrayBuffer | Buffer {
  let hex = parseHex(hexStr);
  hex = parseHex(hexStr, false, Math.ceil(hex.length / 2)); // pad to have a length in bytes
  if (IS_BROWSER) {
    return Uint8Array.from(
      hex.match(/[\da-fA-F]{2}/g)!.map((h) => {
        // ...existing code...
        return Number("0x" + h);
      })
    ).buffer;
  } else {
    const b = Buffer.from(hex, "hex");
    return returnArrayBuffer
      ? b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
      : b;
  }
}

/**
 * Converts an arbitrary-size non-negative bigint to a base64 string
 * @param a - a non negative bigint
 * @param urlsafe - if true Base64 URL encoding is used ('+' and '/' are
 * replaced by '-', '_')
 * @param padding - if false, padding (trailing '=') is removed
 * @returns a base64 representation of the input bigint
 *
 * @throws {RangeError}
 * Thrown if a < 0
 */
export function bigintToBase64(
  a: bigint,
  urlsafe = false,
  padding = true
): string {
  if (a < 0n) {
    throw new RangeError("negative bigint");
  }
  const buf = bigintToBuf(a);
  let base64 = Buffer.isBuffer(buf)
    ? buf.toString("base64")
    : Buffer.from(buf as ArrayBuffer).toString("base64");
  if (urlsafe) {
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_");
  }
  if (!padding) {
    base64 = base64.replace(/=+$/, "");
  }
  return base64;
}

/**
 * Converts a base64 string to bigint.
 * @param a base64 string. It accepts standard and URL-safe base64 with and
 * without padding
 * @returns a bigint
 */
export function base64ToBigint(a: string): bigint {
  if (!a || a.trim() === "") {
    return 0n;
  }
  const cleaned = a.trim();
  if (!/^[A-Za-z0-9+/=_-]*$/.test(cleaned)) {
    throw new RangeError("invalid base64");
  }
  // Implementation now uses Buffer, see above
  let base64 = cleaned.replace(/-/g, "+").replace(/_/g, "/");
  // Pad base64 string if necessary
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const buf = Buffer.from(base64, "base64");
  return bufToBigint(buf);
}
export const FIXED_POINT_DECIMALS = 9;
export const FIXED_POINT_PATTERN = /^-?0x[0-9a-f]+$/i;
export const ZERO_FIXED_POINT: string = "0x0";

const normalizeHex = (value: string): string =>
  value.startsWith("0x") || value.startsWith("0X") ? value : `0x${value}`;

export const toHexString = (value: bigint): string => {
  if (value === 0n) {
    return ZERO_FIXED_POINT;
  }
  const isNegative = value < 0n;
  const absValue = isNegative ? -value : value;
  const hexValue = bigintToHex(absValue);
  return `${isNegative ? "-" : ""}0x${hexValue}`;
};

export const toBigIntValue = (value?: string): bigint => {
  if (!value) {
    return 0n;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 0n;
  }
  const isNegative = trimmed.startsWith("-");
  const body = isNegative ? trimmed.slice(1) : trimmed;
  const normalized = normalizeHex(body);
  const bigValue = hexToBigint(normalized);
  return isNegative ? -bigValue : bigValue;
};

export function toFixedPoint(
  value: number,
  decimals: number = FIXED_POINT_DECIMALS
): string {
  if (!Number.isFinite(value)) {
    return ZERO_FIXED_POINT;
  }
  const scale = 10n ** BigInt(decimals);
  const scaled = BigInt(Math.round(value * Number(scale)));
  return toHexString(scaled);
}

export function fromFixedPoint(value?: string, decimals: number = 9): number {
  if (!value) return 0;
  const trimmed = value.trim();
  if (trimmed.length === 0) return 0;
  const isNegative = trimmed.startsWith('-');
  const body = isNegative ? trimmed.slice(1) : trimmed;
  const bigValue = isNegative ? -BigInt(body) : BigInt(body);
  const scale = 10 ** decimals;
  return Number(bigValue) / scale;
}


export function addFixedPoint(a: string, b: string): string {
  return toHexString(toBigIntValue(a) + toBigIntValue(b));
}

export function subtractFixedPoint(a: string, b: string): string {
  return toHexString(toBigIntValue(a) - toBigIntValue(b));
}

export function averageFixedPoint(values: string[]): string {
  if (values.length === 0) {
    return ZERO_FIXED_POINT;
  }
  const sum = values.reduce((acc, value) => acc + toBigIntValue(value), 0n);
  return toHexString(sum / BigInt(values.length));
}

export function compareFixedPoint(a: string, b: string): number {
  const diff = toBigIntValue(a) - toBigIntValue(b);
  if (diff === 0n) {
    return 0;
  }
  return diff > 0n ? 1 : -1;
}

export function fixedPointToBigInt(value?: string): bigint {
  return toBigIntValue(value);
}
