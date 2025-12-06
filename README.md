![CI](https://github.com/gsknknft/bigint-buffer/actions/workflows/ci.yaml/badge.svg)
![Release](https://github.com/gsknknft/bigint-buffer/actions/workflows/release.yaml/badge.svg)

# @gsknnft/bigint-buffer

Secure BigInt ⇆ Buffer conversion with native bindings, browser fallbacks, and the `bigint-conversion` helper APIs built in. This is the actively maintained fork of the original `bigint-buffer`.

**Upgrade notice:** The current 1.4.x line ships chunked, allocation-free BE/LE converters (Buffer.read/writeBigUInt64* when available) that are fuzzed across empty, tiny, and huge buffers, alongside FixedPoint utilities and packaged native bindings. CI-verified for Node 20–24. Upgrade for the fastest conversions and consistent behaviour across environments.

[![NPM Version](https://img.shields.io/npm/v/@gsknnft/bigint-buffer.svg?style=flat-square)](https://www.npmjs.com/package/@gsknnft/bigint-buffer)
[![Node Version](https://img.shields.io/node/v/@gsknnft/bigint-buffer.svg?style=flat-square)](https://nodejs.org)

---

## Why This Package

- Native N-API binding with pure-JS fallback for browsers and constrained environments.
- Conversion helpers from `bigint-conversion` in-core (no extra deps).
- ESM and CJS exports plus a UMD/browser bundle.
- Actively maintained; legacy `bigint-buffer` is deprecated and flagged by audits.

---

## Install
```bash
npm install @gsknnft/bigint-buffer
# or pnpm/yarn if preferred
```

---

## Quick Start
```ts
import {
  toBigIntBE, toBigIntLE, toBufferBE, toBufferLE,
  bigintToBuf, bufToBigint, bigintToHex, hexToBigint,
  bigintToText, textToBigint, bigintToBase64, base64ToBigint,
  // New in 1.4.5
  toFixedPoint, fromFixedPoint, addFixedPoint, subtractFixedPoint,
  averageFixedPoint, compareFixedPoint, type FixedPoint,
} from "@gsknnft/bigint-buffer";

toBigIntBE(Buffer.from("deadbeef", "hex")); // 3735928559n
toBufferLE(0xdeadbeefn, 6);                 // <Buffer ef be ad de 00 00>
bigintToHex(123456789n);                    // "075bcd15"
textToBigint("Hello");                      // 0x48656c6c6f
bigintToBase64(123456789n);                 // "B1vNFQ=="

// FixedPoint usage
const fp = toFixedPoint(123456789n, 18);    // Convert bigint to FixedPoint
const sum = addFixedPoint(fp, fp);          // Add two FixedPoints
const avg = averageFixedPoint([fp, fp]);    // Average FixedPoints
```

### Performance
- BE/LE conversions now stream bytes directly from buffers (64-bit chunks via Buffer.read/writeBigUInt64* when available) with no intermediate hex copies.
- JS fallback matches the native binding semantics and is exercised against empty, tiny, and very large inputs in CI.
- Native bindings still load automatically when present; the optimized fallback keeps browser and non-native runtimes fast.
- Browser bundlers must polyfill Node built-ins: add a node polyfill plugin (e.g. `rollup-plugin-polyfill-node`) or explicit aliases for `buffer`, `path`, and `fs` so the fallback loader can resolve.

### Pushing Performance Further
- For very large buffers, consider enabling the native binding (included in npm tarball) or adding SIMD/native glue in your host app if you need throughput beyond JS.

### Conversion Utilities
```ts
import { conversionUtils } from "@gsknnft/bigint-buffer";

const arrBuf = conversionUtils.bigintToBuf(123456789n, true); // ArrayBuffer
const hex = conversionUtils.bigintToHex(123456789n, true);    // '0x...' format
const text = conversionUtils.bigintToText(123456789n);
```

---

## Runtime
- Native binary: `build/Release/bigint_buffer.node` (included in npm package; loads automatically when available).
- Fallback: pure JS bundle for browser and non-native installs (now improved in 1.4.5).
- Check which path loaded:
  ```ts
  import { isNative } from "@gsknnft/bigint-buffer";
  console.log(isNative); // true when native binding is active
  ```

---

## Commands
```bash
npm run build           # bundle + declarations + type check
npm test                # vitest with coverage
npm run test:node       # mocha against built JS (after build/compile)
npm run rebuild:native  # rebuild the N-API binding
```

---

## API Surface (high level)
- Core: `toBigIntBE/LE`, `toBufferBE/LE`, `validateBigIntBuffer`, `isNative`
- Conversion: `bigintToBuf`, `bufToBigint`, `bigintToHex`, `hexToBigint`, `bigintToText`, `textToBigint`, `bigintToBase64`, `base64ToBigint`, `bufToHex`, `hexToBuf`, `textToBuf`, `bufToText`, `parseHex`

All helpers are endian-safe and validated across Node and browser builds.

---
 
## Support
- Version: 1.4.5 (FixedPoint, native bindings out-of-the-box, improved JS fallback)
- Node: 20+ (tested through 24 LTS under CI)
- Issues: https://github.com/gsknnft/bigint-buffer/issues
