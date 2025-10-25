[**bigint-conversion**](../README.md)

***

[bigint-conversion](../README.md) / bufToHex

# Function: bufToHex()

> **bufToHex**(`buf`, `prefix0x`, `byteLength?`): `string`

Defined in: index.ts:269

Returns the hexadecimal representation of a buffer.

## Parameters

### buf

`ArrayBuffer` | `Buffer`\<`ArrayBufferLike`\> | [`TypedArray`](../type-aliases/TypedArray.md)

### prefix0x

`boolean` = `false`

set to true to prefix the output with '0x'

### byteLength?

`number`

pad the output to have the desired byte length. Notice that the hex length is double the byte length.

## Returns

`string`

a string with a hexadecimal representation of the input buffer
