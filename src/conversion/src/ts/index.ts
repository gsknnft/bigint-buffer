import * as b64 from '@juanelas/base64'

interface ConverterInterface {
  toBigInt: (buf: Buffer, bigEndian?: boolean) => bigint
  fromBigInt: (num: bigint, buf: Buffer, bigEndian?: boolean) => Buffer
}

declare let process: { browser: boolean }

export let isNative = false
let converter: ConverterInterface

const IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined'

if (!process.browser) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    converter = require('bindings')('bigint_buffer')
    isNative = converter !== undefined
  } catch (e) {
    console.warn('bigint: Failed to load bindings, pure JS will be used (try npm run rebuild?)')
  }
} else {
  // fallback to pure JS if needed
  converter = {
    toBigInt: (buf: Buffer) => BigInt('0x' + Buffer.from(buf).toString('hex')),
    fromBigInt: (num: bigint) => Buffer.from(num.toString(16), 'hex')
  }
}

/**
 * Convert a little-endian buffer into a BigInt.
 * @param buf The little-endian buffer to convert
 * @returns A BigInt with the little-endian representation of buf.
 */
export function toBigIntLE (buf: Buffer): bigint {
  if (process.browser || converter === undefined) {
    const reversed = Buffer.from(buf)
    reversed.reverse()
    const hex = reversed.toString('hex')
    if (hex.length === 0) {
      return BigInt(0)
    }
    return BigInt(`0x${hex}`)
  }
  return converter.toBigInt(buf, false)
}

export function validateBigIntBuffer (): boolean {
  try {
    const test = toBigIntLE(Buffer.from([0x01, 0x00]))
    return test === BigInt(1)
  } catch {
    return false
  }
}

/**
 * Convert a big-endian buffer into a BigInt
 * @param buf The big-endian buffer to convert.
 * @returns A BigInt with the big-endian representation of buf.
 */
export function toBigIntBE (buf: Buffer): bigint {
  if (process.browser || converter === undefined) {
    const hex = buf.toString('hex')
    if (hex.length === 0) {
      return BigInt(0)
    }
    return BigInt(`0x${hex}`)
  }
  return converter.toBigInt(buf, true)
}

/**
 * Convert a BigInt to a little-endian buffer.
 * @param num   The BigInt to convert.
 * @param width The number of bytes that the resulting buffer should be.
 * @returns A little-endian buffer representation of num.
 */
export function toBufferLE (num: bigint, width: number): Buffer {
  if (process.browser || converter === undefined) {
    const hex = num.toString(16)
    const buffer =
        Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex')
    buffer.reverse()
    return buffer
  }
  // Allocation is done here, since it is slower using napi in C
  return converter.fromBigInt(num, Buffer.allocUnsafe(width), false)
}

/**
 * Convert a BigInt to a big-endian buffer.
 * @param num   The BigInt to convert.
 * @param width The number of bytes that the resulting buffer should be.
 * @returns A big-endian buffer representation of num.
 */
export function toBufferBE (num: bigint, width: number): Buffer {
  if (process.browser || converter === undefined) {
    const hex = num.toString(16)
    return Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex')
  }
  return converter.fromBigInt(num, Buffer.allocUnsafe(width), true)
}

export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array

/**
 * Parses a hexadecimal string for correctness and returns it with or without '0x' prefix, and/or with the specified byte length
 * @param a - the string with an hexadecimal number to be parsed
 * @param prefix0x - set to true to prefix the output with '0x'
 * @param byteLength - pad the output to have the desired byte length. Notice that the hex length is double the byte length.
 *
 * @returns
 *
 * @throws {@link RangeError} if input string does not hold an hexadecimal number
 * @throws {@link RangeError} if requested byte length is less than the input byte length
 */
export function parseHex (a: string, prefix0x: boolean = false, byteLength?: number): string {
  const hexMatch = a.match(/^(0x)?([\da-fA-F]+)$/)
  if (hexMatch == null) {
    throw new RangeError('input must be a hexadecimal string, e.g. \'0x124fe3a\' or \'0214f1b2\'')
  }
  let hex = hexMatch[2]
  if (byteLength !== undefined) {
    if (byteLength < hex.length / 2) {
      throw new RangeError(`expected byte length ${byteLength} < input hex byte length ${Math.ceil(hex.length / 2)}`)
    }
    hex = hex.padStart(byteLength * 2, '0')
  }
  return (prefix0x) ? '0x' + hex : hex
}

/**
 * Converts an arbitrary-size non-negative bigint to an ArrayBuffer or a Buffer (default for Node.js)
 *
 * @param a
 * @param returnArrayBuffer - In Node.js, it forces the output to be an ArrayBuffer instead of a Buffer.
 *
 * @returns an ArrayBuffer or a Buffer with a binary representation of the input bigint
 *
 * @throws {@link RangeError} if a < 0.
 */
export function bigintToBuf (a: bigint, returnArrayBuffer: boolean = false): ArrayBuffer | Buffer {
  if (a < 0) throw RangeError('a should be a non-negative integer. Negative values are not supported')
  return hexToBuf(bigintToHex(a), returnArrayBuffer)
}

/**
 * Converts an ArrayBuffer, TypedArray or Buffer (node.js) to a bigint
 * @param buf
 * @returns a bigint
 */
export function bufToBigint (buf: ArrayBuffer | TypedArray | Buffer): bigint {
  let bits = 8n
  if (ArrayBuffer.isView(buf)) bits = BigInt(buf.BYTES_PER_ELEMENT * 8)
  else buf = new Uint8Array(buf)

  let ret = 0n
  for (const i of (buf).values()) {
    const bi = BigInt(i)
    ret = (ret << bits) + bi
  }
  return ret
}

/**
 * Converts a non-negative bigint to a hexadecimal string
 * @param a - a non negative bigint
 * @param prefix0x - set to true to prefix the output with '0x'
 * @param byteLength - pad the output to have the desired byte length. Notice that the hex length is double the byte length.
 *
 * @returns hexadecimal representation of the input bigint
 *
 * @throws {@link RangeError} if a < 0
 */
export function bigintToHex (a: bigint, prefix0x: boolean = false, byteLength?: number): string {
  if (a < 0) throw RangeError('a should be a non-negative integer. Negative values are not supported')
  return parseHex(a.toString(16), prefix0x, byteLength)
}

/**
 * Converts a hexadecimal string to a bigint
 *
 * @param hexStr
 *
 * @returns a bigint
 *
 * @throws {@link RangeError} if input string does not hold an hexadecimal number
 */
export function hexToBigint (hexStr: string): bigint {
  return BigInt(parseHex(hexStr, true))
}

/**
 * Converts a non-negative bigint representing a binary array of utf-8 encoded text to a string of utf-8 text
 *
 * @param a - A non-negative bigint representing a binary array of utf-8 encoded text.
 *
 * @returns a string text with utf-8 encoding
 *
 * @throws {@link RangeError} if a < 0.
 */
export function bigintToText (a: bigint): string {
  if (a < 0) throw RangeError('a should be a non-negative integer. Negative values are not supported')
  return bufToText(hexToBuf(a.toString(16)))
}

/**
 * Converts a utf-8 string to a bigint (from its binary representaion)
 *
 * @param text - A string text with utf-8 encoding
 *
 * @returns a bigint representing a binary array of the input utf-8 encoded text
 */
export function textToBigint (text: string): bigint {
  return hexToBigint(bufToHex(textToBuf(text)))
}
function toBuffer (input: ArrayBuffer | TypedArray | Buffer): Buffer {
  if (Buffer.isBuffer(input)) return input

  if (ArrayBuffer.isView(input)) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength)
  }

  if (input instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(input))
  }

  throw new TypeError('Unsupported input type for Buffer.from')
}
/**
 * Converts an ArrayBuffer, TypedArray or Buffer (in Node.js) containing utf-8 encoded text to a string of utf-8 text
 *
 * @param buf - A buffer containing utf-8 encoded text
 *
 * @returns a string text with utf-8 encoding
 */
export function bufToText (buf: ArrayBuffer | TypedArray | Buffer): string {
  const input = toBuffer(buf)
  if (IS_BROWSER) return new TextDecoder().decode(new Uint8Array(input))
  else return Buffer.from(input).toString()
}

/**
 * Converts a string of utf-8 encoded text to an ArrayBuffer or a Buffer (default in Node.js)
 *
 * @param str - A string of text (with utf-8 encoding)
 * @param returnArrayBuffer - When invoked in Node.js, it can force the output to be an ArrayBuffer instead of a Buffer.
 *
 * @returns an ArrayBuffer or a Buffer containing the utf-8 encoded text
 */
export function textToBuf (str: string, returnArrayBuffer: boolean = false): ArrayBuffer | Buffer {
  if (!IS_BROWSER && !returnArrayBuffer) {
    return Buffer.from(new TextEncoder().encode(str).buffer)
  }
  return new TextEncoder().encode(str).buffer
}

/**
 * Returns the hexadecimal representation of a buffer.
 *
 * @param buf
 * @param prefix0x - set to true to prefix the output with '0x'
 * @param byteLength - pad the output to have the desired byte length. Notice that the hex length is double the byte length.
 *
 * @returns a string with a hexadecimal representation of the input buffer
 */
export function bufToHex (buf: ArrayBuffer | TypedArray | Buffer, prefix0x: boolean = false, byteLength?: number): string {
  if (IS_BROWSER) {
    let s = ''
    const h = '0123456789abcdef'
    if (ArrayBuffer.isView(buf)) buf = new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
    else buf = new Uint8Array(buf);

    (buf as Uint8Array).forEach((v) => {
      s += h[v >> 4] + h[v & 15]
    })

    return parseHex(s, prefix0x, byteLength)
  } else {
    const input = toBuffer(buf)
    if (ArrayBuffer.isView(input)) buf = new Uint8Array(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength))
    return parseHex(Buffer.from(input).toString('hex'), prefix0x, byteLength)
  }
}

/**
 * Converts a hexadecimal string to a buffer
 *
 * @param hexStr - A string representing a number with hexadecimal notation
 * @param returnArrayBuffer - In Node.js, it forces the output to be an ArrayBuffer instead of a Buffer.
 *
 * @returns An ArrayBuffer or a Buffer
 *
 * @throws {@link RangeError} if input string does not hold an hexadecimal number
 */
export function hexToBuf (hexStr: string, returnArrayBuffer: boolean = false): ArrayBuffer | Buffer {
  let hex = parseHex(hexStr)
  hex = parseHex(hexStr, false, Math.ceil(hex.length / 2)) // pad to have a length in bytes
  if (IS_BROWSER) {
    return Uint8Array.from(hex.match(/[\da-fA-F]{2}/g)!.map((h) => { // eslint-disable-line
      return parseInt(h, 16)
    })).buffer
  } else {
    const b = Buffer.from(hex, 'hex')
    return returnArrayBuffer ? b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) : b
  }
}

/**
 * Converts an arbitrary-size non-negative bigint to a base64 string
 * @param a - a non negative bigint
 * @param urlsafe - if true Base64 URL encoding is used ('+' and '/' are replaced by '-', '_')
 * @param padding - if false, padding (trailing '=') is removed
 * @returns a base64 representation of the input bigint
 *
 * @throws {RangeError}
 * Thrown if a < 0
 */
export function bigintToBase64 (a: bigint, urlsafe: boolean = false, padding: boolean = true): string {
  return b64.encode(bigintToBuf(a), urlsafe, padding)
}

/**
 * Converts a base64 string to bigint.
 * @param a base64 string. It accepts standard and URL-safe base64 with and without padding
 * @returns a bigint
 */
export function base64ToBigint (a: string): bigint {
  return bufToBigint(b64.decode(a))
}
