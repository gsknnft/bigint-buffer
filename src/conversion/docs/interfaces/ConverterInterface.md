[**bigint-conversion**](../README.md)

***

[bigint-conversion](../README.md) / ConverterInterface

# Interface: ConverterInterface

Defined in: converter.ts:8

## Properties

### fromBigInt()

> **fromBigInt**: (`num`, `buf`, `bigEndian?`) => `Buffer`

Defined in: converter.ts:10

#### Parameters

##### num

`bigint`

##### buf

`Buffer`

##### bigEndian?

`boolean`

#### Returns

`Buffer`

***

### toBigInt()

> **toBigInt**: (`buf`, `bigEndian?`) => `bigint`

Defined in: converter.ts:9

#### Parameters

##### buf

`Buffer`

##### bigEndian?

`boolean`

#### Returns

`bigint`
