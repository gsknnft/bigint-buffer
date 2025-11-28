[**bigint-conversion**](../README.md)

***

[bigint-conversion](../README.md) / parseHex

# Function: parseHex()

> **parseHex**(`a`, `prefix0x`, `byteLength?`): `string`

Defined in: index.ts:119

Parses a hexadecimal string for correctness and returns it with or without '0x' prefix, and/or with the specified byte length

## Parameters

### a

`string`

the string with an hexadecimal number to be parsed

### prefix0x

`boolean` = `false`

set to true to prefix the output with '0x'

### byteLength?

`number`

pad the output to have the desired byte length. Notice that the hex length is double the byte length.

## Returns

`string`

## Throws

RangeError if input string does not hold an hexadecimal number

## Throws

RangeError if requested byte length is less than the input byte length
