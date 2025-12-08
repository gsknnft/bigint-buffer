[**bigint-conversion**](../README.md)

***

[bigint-conversion](../README.md) / bigintToHex

# Function: bigintToHex()

> **bigintToHex**(`a`, `prefix0x`, `byteLength?`): `string`

Defined in: index.ts:227

Converts a non-negative bigint to a hexadecimal string

## Parameters

### a

`bigint`

a non negative bigint

### prefix0x

`boolean` = `false`

set to true to prefix the output with '0x'

### byteLength?

`number`

pad the output to have the desired byte length. Notice
that the hex length is double the byte length.

## Returns

`string`

hexadecimal representation of the input bigint

## Throws

RangeError if a < 0
