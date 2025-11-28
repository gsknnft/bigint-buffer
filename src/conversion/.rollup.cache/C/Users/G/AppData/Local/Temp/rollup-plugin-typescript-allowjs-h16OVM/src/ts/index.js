import * as b64 from '@juanelas/base64';
export let isNative = false;
let converter;
const IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';
if (!process.browser) {
    try {
        converter = require('bindings')('bigint_buffer');
        isNative = converter !== undefined;
    }
    catch (e) {
        console.warn('bigint: Failed to load bindings, pure JS will be used (try npm run rebuild?)');
    }
}
else {
    converter = {
        toBigInt: (buf) => BigInt('0x' + Buffer.from(buf).toString('hex')),
        fromBigInt: (num) => Buffer.from(num.toString(16), 'hex')
    };
}
export function toBigIntLE(buf) {
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
export function validateBigIntBuffer() {
    try {
        const test = toBigIntLE(Buffer.from([0x01, 0x00]));
        return test === BigInt(1);
    }
    catch {
        return false;
    }
}
export function toBigIntBE(buf) {
    if (process.browser || converter === undefined) {
        const hex = buf.toString('hex');
        if (hex.length === 0) {
            return BigInt(0);
        }
        return BigInt(`0x${hex}`);
    }
    return converter.toBigInt(buf, true);
}
export function toBufferLE(num, width) {
    if (process.browser || converter === undefined) {
        const hex = num.toString(16);
        const buffer = Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
        buffer.reverse();
        return buffer;
    }
    return converter.fromBigInt(num, Buffer.allocUnsafe(width), false);
}
export function toBufferBE(num, width) {
    if (process.browser || converter === undefined) {
        const hex = num.toString(16);
        return Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
    }
    return converter.fromBigInt(num, Buffer.allocUnsafe(width), true);
}
export function parseHex(a, prefix0x = false, byteLength) {
    const hexMatch = a.match(/^(0x)?([\da-fA-F]+)$/);
    if (hexMatch == null) {
        throw new RangeError('input must be a hexadecimal string, e.g. \'0x124fe3a\' or \'0214f1b2\'');
    }
    let hex = hexMatch[2];
    if (byteLength !== undefined) {
        if (byteLength < hex.length / 2) {
            throw new RangeError(`expected byte length ${byteLength} < input hex byte length ${Math.ceil(hex.length / 2)}`);
        }
        hex = hex.padStart(byteLength * 2, '0');
    }
    return (prefix0x) ? '0x' + hex : hex;
}
export function bigintToBuf(a, returnArrayBuffer = false) {
    if (a < 0)
        throw RangeError('a should be a non-negative integer. Negative values are not supported');
    return hexToBuf(bigintToHex(a), returnArrayBuffer);
}
export function bufToBigint(buf) {
    let bits = 8n;
    if (ArrayBuffer.isView(buf))
        bits = BigInt(buf.BYTES_PER_ELEMENT * 8);
    else
        buf = new Uint8Array(buf);
    let ret = 0n;
    for (const i of (buf).values()) {
        const bi = BigInt(i);
        ret = (ret << bits) + bi;
    }
    return ret;
}
export function bigintToHex(a, prefix0x = false, byteLength) {
    if (a < 0)
        throw RangeError('a should be a non-negative integer. Negative values are not supported');
    return parseHex(a.toString(16), prefix0x, byteLength);
}
export function hexToBigint(hexStr) {
    return BigInt(parseHex(hexStr, true));
}
export function bigintToText(a) {
    if (a < 0)
        throw RangeError('a should be a non-negative integer. Negative values are not supported');
    return bufToText(hexToBuf(a.toString(16)));
}
export function textToBigint(text) {
    return hexToBigint(bufToHex(textToBuf(text)));
}
function toBuffer(input) {
    if (Buffer.isBuffer(input))
        return input;
    if (ArrayBuffer.isView(input)) {
        return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
    }
    if (input instanceof ArrayBuffer) {
        return Buffer.from(new Uint8Array(input));
    }
    throw new TypeError('Unsupported input type for Buffer.from');
}
export function bufToText(buf) {
    const input = toBuffer(buf);
    if (IS_BROWSER)
        return new TextDecoder().decode(new Uint8Array(input));
    else
        return Buffer.from(input).toString();
}
export function textToBuf(str, returnArrayBuffer = false) {
    if (!IS_BROWSER && !returnArrayBuffer) {
        return Buffer.from(new TextEncoder().encode(str).buffer);
    }
    return new TextEncoder().encode(str).buffer;
}
export function bufToHex(buf, prefix0x = false, byteLength) {
    if (IS_BROWSER) {
        let s = '';
        const h = '0123456789abcdef';
        if (ArrayBuffer.isView(buf))
            buf = new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
        else
            buf = new Uint8Array(buf);
        buf.forEach((v) => {
            s += h[v >> 4] + h[v & 15];
        });
        return parseHex(s, prefix0x, byteLength);
    }
    else {
        const input = toBuffer(buf);
        if (ArrayBuffer.isView(input))
            buf = new Uint8Array(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength));
        return parseHex(Buffer.from(input).toString('hex'), prefix0x, byteLength);
    }
}
export function hexToBuf(hexStr, returnArrayBuffer = false) {
    let hex = parseHex(hexStr);
    hex = parseHex(hexStr, false, Math.ceil(hex.length / 2));
    if (IS_BROWSER) {
        return Uint8Array.from(hex.match(/[\da-fA-F]{2}/g).map((h) => {
            return parseInt(h, 16);
        })).buffer;
    }
    else {
        const b = Buffer.from(hex, 'hex');
        return returnArrayBuffer ? b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) : b;
    }
}
export function bigintToBase64(a, urlsafe = false, padding = true) {
    return b64.encode(bigintToBuf(a), urlsafe, padding);
}
export function base64ToBigint(a) {
    return bufToBigint(b64.decode(a));
}
//# sourceMappingURL=index.js.map