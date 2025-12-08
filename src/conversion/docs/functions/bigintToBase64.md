[**bigint-conversion**](../README.md)

***

[bigint-conversion](../README.md) / bigintToBase64

# Function: bigintToBase64()

> **bigintToBase64**(`a`, `urlsafe`, `padding`): `string`

Defined in: index.ts:427

Converts an arbitrary-size non-negative bigint to a base64 string

## Parameters

### a

`bigint`

a non negative bigint

### urlsafe

`boolean` = `false`

if true Base64 URL encoding is used ('+' and '/' are
replaced by '-', '_')

### padding

`boolean` = `true`

if false, padding (trailing '=') is removed

## Returns

`string`

a base64 representation of the input bigint

## Throws

Thrown if a < 0
