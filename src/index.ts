import * as conv from './conversion/index.js';

export const isNative = conv.isNative;
export const toBigIntLE = conv.toBigIntLE;
export const toBigIntBE = conv.toBigIntBE;
export const toBufferLE = conv.toBufferLE;
export const toBufferBE = conv.toBufferBE;
export const bufToBigint = conv.bufToBigint;
export const parseHex = conv.parseHex;
export const bufToHex = conv.bufToHex;
export const bufToText = conv.bufToText;
export const textToBuf = conv.textToBuf;
export const hexToBuf = conv.hexToBuf;
export type TypedArray = conv.TypedArray;

const toBufferFromMaybeArrayBuffer = (value: ArrayBuffer|Buffer): Buffer => {
  return Buffer.isBuffer(value) ? value : Buffer.from(new Uint8Array(value));
};

export function bigintToBuf(a: bigint, returnArrayBuffer = false): ArrayBuffer|
    Buffer {
  if (a < 0n) throw new RangeError('negative bigint');
  const result = conv.bigintToBuf(a, returnArrayBuffer);
  return result;
}

export function bigintToHex(
    a: bigint, prefix0x = false, byteLength?: number): string {
  if (a < 0n) throw new RangeError('negative bigint');
  let hex = a.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex;
  if (byteLength !== undefined) {
    if (byteLength < Math.ceil(hex.length / 2)) {
      throw new RangeError('byteLength too small');
    }
    hex = hex.padStart(byteLength * 2, '0');
  }
  return prefix0x ? `0x${hex}` : hex;
}

export function hexToBigint(hexStr: string): bigint {
  const clean = hexStr.trim().replace(/^0x/i, '');
  if (clean.length === 0) throw new RangeError('hex string cannot be empty');
  const evenHex = clean.length % 2 === 0 ? clean : `0${clean}`;
  return BigInt(`0x${evenHex}`);
}

export function bigintToText(a: bigint): string {
  if (a < 0n) throw new RangeError('negative bigint');
  return a.toString(10);
}

export function textToBigint(text: string): bigint {
  if (!text || text.trim() === '') throw new RangeError('text cannot be empty');
  const trimmed = text.trim();
  if (/^-?\d+$/.test(trimmed)) return BigInt(trimmed);
  const hex = Buffer.from(trimmed, 'utf8').toString('hex');
  return BigInt(`0x${hex === '' ? '0' : hex}`);
}

export function bigintToBase64(a: bigint): string {
  if (a < 0n) throw new RangeError('negative bigint');
  const buf = toBufferFromMaybeArrayBuffer(conv.bigintToBuf(a, false));
  return buf.toString('base64');
}

export function base64ToBigint(a: string): bigint {
  if (!a || a.trim() === '') return 0n;
  const trimmed = a.trim().replace(/\s+/g, '');
  // Canonical base64: length must be multiple of 4, only valid chars, correct
  // padding
  const canonicalBase64Regex =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  const urlSafeBase64Regex =
      /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2}==|[A-Za-z0-9_-]{3}=)?$/;
  if (
      trimmed !== '' &&
      (trimmed.length % 4 !== 0 ||
       (!canonicalBase64Regex.test(trimmed) &&
        !urlSafeBase64Regex.test(trimmed)) ||
       /={3,}/.test(trimmed) ||            // no more than two padding chars
       /[^A-Za-z0-9+/=_-]/.test(trimmed))  // only valid chars
  ) {
    throw new RangeError('invalid base64');
  }
  // Limit max length to 4096 chars (arbitrary, can be tuned)
  if (trimmed.length > 4096) {
    throw new RangeError('base64 input too long');
  }
  try {
    const buf = Buffer.from(trimmed, 'base64');
    if (trimmed !== '' && buf.length === 0) {
      throw new RangeError('invalid base64');
    }
    return conv.bufToBigint(buf);
  } catch {
    throw new RangeError('invalid base64');
  }
}
// import bindings from 'bindings'

// interface ConverterInterface {
//   toBigInt: (buf: Buffer, bigEndian?: boolean) => bigint
//   fromBigInt: (num: bigint, buf: Buffer, bigEndian?: boolean) => Buffer
// }

// declare let process: { browser: boolean }

// let converter: ConverterInterface
// export let isNative = false

// if (!process.browser) {
//   try {
//     converter = bindings('bigint_buffer')
//     isNative = converter !== undefined
//   } catch {
//     console.warn('bigint: Failed to load bindings, pure JS will be used (try
//     npm run rebuild?)')
//   }
// }
// /**
//  * Convert a little-endian buffer into a BigInt.
//  * @param buf The little-endian buffer to convert
//  * @returns A BigInt with the little-endian representation of buf.
//  */
// export function toBigIntLE (buf: Buffer): bigint {
//   if (process.browser || converter === undefined) {
//     const reversed = Buffer.from(buf)
//     reversed.reverse()
//     const hex = reversed.toString('hex')
//     if (hex.length === 0) {
//       return BigInt(0)
//     }
//     return BigInt(`0x${hex}`)
//   }
//   return converter.toBigInt(buf, false)
// }

// export function validateBigIntBuffer (): boolean {
//   try {
//     const test = toBigIntLE(Buffer.from([0x01, 0x00]))
//     return test === BigInt(1)
//   } catch {
//     return false
//   }
// }

// /**
//  * Convert a big-endian buffer into a BigInt
//  * @param buf The big-endian buffer to convert.
//  * @returns A BigInt with the big-endian representation of buf.
//  */
// export function toBigIntBE (buf: Buffer): bigint {
//   if (process.browser || converter === undefined) {
//     const hex = buf.toString('hex')
//     if (hex.length === 0) {
//       return BigInt(0)
//     }
//     return BigInt(`0x${hex}`)
//   }
//   return converter.toBigInt(buf, true)
// }

// /**
//  * Convert a BigInt to a little-endian buffer.
//  * @param num   The BigInt to convert.
//  * @param width The number of bytes that the resulting buffer should be.
//  * @returns A little-endian buffer representation of num.
//  */
// export function toBufferLE (num: bigint, width: number): Buffer {
//   if (process.browser || converter === undefined) {
//     const hex = num.toString(16)
//     const buffer =
//         Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex')
//     buffer.reverse()
//     return buffer
//   }
//   // Allocation is done here, since it is slower using napi in C
//   return converter.fromBigInt(num, Buffer.allocUnsafe(width), false)
// }

// /**
//  * Convert a BigInt to a big-endian buffer.
//  * @param num   The BigInt to convert.
//  * @param width The number of bytes that the resulting buffer should be.
//  * @returns A big-endian buffer representation of num.
//  */
// export function toBufferBE (num: bigint, width: number): Buffer {
//   if (process.browser || converter === undefined) {
//     const hex = num.toString(16)
//     return Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2),
//     'hex')
//   }
//   return converter.fromBigInt(num, Buffer.allocUnsafe(width), true)
// }

// // Export all conversion utilities from the integrated bigint-conversion
// module export {
//   parseHex,
//   bigintToBuf,
//   bufToBigint,
//   bigintToHex,
//   hexToBigint,
//   bigintToText,
//   textToBigint,
//   bufToText,
//   textToBuf,
//   bufToHex,
//   hexToBuf,
//   bigintToBase64,
//   base64ToBigint,
//   type TypedArray
// } from './conversion/src/ts/index.js'
