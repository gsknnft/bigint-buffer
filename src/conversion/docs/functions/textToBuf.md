[**bigint-conversion**](../README.md)

***

[bigint-conversion](../README.md) / textToBuf

# Function: textToBuf()

> **textToBuf**(`str`, `returnArrayBuffer`): `ArrayBuffer` \| `Buffer`\<`ArrayBufferLike`\>

Defined in: index.ts:253

Converts a string of utf-8 encoded text to an ArrayBuffer or a Buffer (default in Node.js)

## Parameters

### str

`string`

A string of text (with utf-8 encoding)

### returnArrayBuffer

`boolean` = `false`

When invoked in Node.js, it can force the output to be an ArrayBuffer instead of a Buffer.

## Returns

`ArrayBuffer` \| `Buffer`\<`ArrayBufferLike`\>

an ArrayBuffer or a Buffer containing the utf-8 encoded text
