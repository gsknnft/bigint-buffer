
interface ConverterInterface {
  toBigInt(buf: Buffer, bigEndian?: boolean): bigint;
  fromBigInt(num: BigInt, buf: Buffer, bigEndian?: boolean): Buffer;
}

declare var process: {browser: boolean;};

let converter: ConverterInterface;
export let isNative = false;

if (!process.browser) {
  try {
    converter = require('bindings')('bigint_buffer');
    isNative = !process.browser && converter !== undefined;
  } catch (e) {
    console.warn(
        'bigint: Failed to load bindings, pure JS will be used (try npm run rebuild?)');
  }
}

/**
 * Convert a little-endian buffer into a BigInt.
 * @param buf The little-endian buffer to convert
 * @returns A BigInt with the little-endian representation of buf.
 */
export function toBigIntLE(buf: Buffer): bigint {
  if (process.browser || converter === undefined) {
    const reversed = Buffer.from(buf);
    reversed.reverse();
    const hex = reversed.toString('hex');
    if (hex.length === 0) {
      return BigInt(0);
    }
    return BigInt(`0x${hex}`);
  }
  return converter.toBigInt(buf, false);
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
export function toBigIntBE(buf: Buffer): bigint {
  if (process.browser || converter === undefined) {
    const hex = buf.toString('hex');
    if (hex.length === 0) {
      return BigInt(0);
    }
    return BigInt(`0x${hex}`);
  }
  return converter.toBigInt(buf, true);
}

/**
 * Convert a BigInt to a little-endian buffer.
 * @param num   The BigInt to convert.
 * @param width The number of bytes that the resulting buffer should be.
 * @returns A little-endian buffer representation of num.
 */
export function toBufferLE(num: bigint, width: number): Buffer {
  if (process.browser || converter === undefined) {
    const hex = num.toString(16);
    const buffer =
        Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
    buffer.reverse();
    return buffer;
  }
  // Allocation is done here, since it is slower using napi in C
  return converter.fromBigInt(num, Buffer.allocUnsafe(width), false);
}

/**
 * Convert a BigInt to a big-endian buffer.
 * @param num   The BigInt to convert.
 * @param width The number of bytes that the resulting buffer should be.
 * @returns A big-endian buffer representation of num.
 */
export function toBufferBE(num: bigint, width: number): Buffer {
  if (process.browser || converter === undefined) {
    const hex = num.toString(16);
    return Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
  }
  return converter.fromBigInt(num, Buffer.allocUnsafe(width), true);
}

// ========== Conversion Utilities ==========

/**
 * Convert a bigint to a Buffer with automatic sizing.
 * Uses big-endian encoding and calculates the minimum buffer size needed.
 * @param num The bigint to convert
 * @returns A big-endian Buffer representation
 */
export function bigintToBuf(num: bigint): Buffer {
  if (num === BigInt(0)) {
    return Buffer.from([0]);
  }
  // Calculate the number of bytes needed
  const hex = num.toString(16);
  const width = Math.ceil(hex.length / 2);
  return toBufferBE(num, width);
}

/**
 * Convert a Buffer to a bigint.
 * Assumes big-endian encoding.
 * @param buf The buffer to convert
 * @returns A bigint representation of the buffer
 */
export function bufToBigint(buf: Buffer): bigint {
  return toBigIntBE(buf);
}

/**
 * Convert a bigint to a hexadecimal string.
 * @param num The bigint to convert
 * @returns A hexadecimal string (without '0x' prefix)
 */
export function bigintToHex(num: bigint): string {
  const hex = num.toString(16);
  // Ensure even length for proper byte representation
  return hex.length % 2 === 0 ? hex : '0' + hex;
}

/**
 * Convert a hexadecimal string to a bigint.
 * @param hex The hexadecimal string (with or without '0x' prefix)
 * @returns A bigint representation
 */
export function hexToBigint(hex: string): bigint {
  // Remove '0x' prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
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
  return BigInt(text);
}

/**
 * Convert a bigint to a base64 string.
 * @param num The bigint to convert
 * @returns A base64 string representation
 */
export function bigintToBase64(num: bigint): string {
  const buf = bigintToBuf(num);
  return buf.toString('base64');
}

/**
 * Convert a base64 string to a bigint.
 * @param base64 The base64 string to convert
 * @returns A bigint representation
 */
export function base64ToBigint(base64: string): bigint {
  const buf = Buffer.from(base64, 'base64');
  return bufToBigint(buf);
}