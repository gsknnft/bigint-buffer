[**bigint-conversion**](../README.md)

***

[bigint-conversion](../README.md) / hexToBuf

# Function: hexToBuf()

> **hexToBuf**(`hexStr`, `returnArrayBuffer`): `ArrayBuffer` \| `Buffer`\<`ArrayBufferLike`\>

Defined in: index.ts:395

Converts a hexadecimal string to a buffer

## Parameters

### hexStr

`string`

A string representing a number with hexadecimal notation

### returnArrayBuffer

`boolean` = `false`

In Node.js, it forces the output to be an
ArrayBuffer instead of a Buffer.

## Returns

`ArrayBuffer` \| `Buffer`\<`ArrayBufferLike`\>

An ArrayBuffer or a Buffer

## Throws

RangeError if input string does not hold an hexadecimal number
