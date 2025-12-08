[**bigint-conversion**](../README.md)

***

[bigint-conversion](../README.md) / bigintToBuf

# Function: bigintToBuf()

> **bigintToBuf**(`a`, `returnArrayBuffer`): `ArrayBuffer` \| `Buffer`\<`ArrayBufferLike`\>

Defined in: index.ts:183

Converts an arbitrary-size non-negative bigint to an ArrayBuffer or a Buffer
(default for Node.js)

## Parameters

### a

`bigint`

### returnArrayBuffer

`boolean` = `false`

In Node.js, it forces the output to be an
ArrayBuffer instead of a Buffer.

## Returns

`ArrayBuffer` \| `Buffer`\<`ArrayBufferLike`\>

an ArrayBuffer or a Buffer with a binary representation of the input
bigint

## Throws

RangeError if a < 0.
