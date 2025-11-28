# 💪🔢 @gsknnft/bigint-buffer: Secure Buffer Utilities for TC39 BigInt Proposal

[![NPM Version](https://img.shields.io/npm/v/@gsknnft/bigint-buffer.svg?style=flat-square)](https://www.npmjs.com/package/@gsknnft/bigint-buffer)
[![Node Version](https://img.shields.io/node/v/@gsknnft/bigint-buffer.svg?style=flat-square)](https://nodejs.org)
[![Maintained Fork](https://img.shields.io/badge/fork-maintained-blue?style=flat-square)](https://github.com/gsknnft/bigint-buffer)
Modern, secure BigInt ↔ Buffer conversion with native bindings, browser fallbacks, and the full `bigint-conversion` API built in.

---

## 🔐 Security Notice: This Module Has Been Reclaimed

As of October 2025, `bigint-buffer@1.1.5` is **compromised and flagged by multiple audit tools** due to unresolved vulnerabilities in its native bindings and transitive dependencies. No upstream patch has been published.

**This fork is maintained by CoreFlame/GSKNNFT as part of the SigilNet ecosystem.**

---

## Why BigInts?

BigInts are primitive arbitrary precision integers, overcoming the limitations of JS numbers (max 53 bits). They enable safe manipulation of 64, 128, 256+ bit values (e.g., database IDs, hashes) with much better performance than Buffer or BN.js.

**Performance highlights:**

```
Buffer equality: 12M ops/s
BigInt equality: 798M ops/s
BN.js equality: 73M ops/s
BN.js multiply: 4.7M ops/s
BigInt multiply: 15M ops/s
```

---

## Why This Package?

It is the only currently known secure, reproducible implementation of BigInt ↔ Buffer conversion with native fallback.

- Efficient, secure conversion between BigInt and Buffer (native N-API bindings in Node, pure JS fallback in browser)
- All conversion helpers built-in (no need for `bigint-conversion`)
- Endian-safe, round-trip validated
- Unified types and exports
- No audit vulnerabilities
- Patched and rebuilt native bindings (Node 18+)
- First-class ESM/CJS exports plus browser bundle
- Conversion helpers in-core (no separate `bigint-conversion`)
- Actively maintained by GSKNNFT/CoreFlame

## 🔍 Differences from Upstream

- Rebuilt native bindings with modern Node compatibility
- Scoped under `@gsknnft` for audit clarity
- Uses `cpy-cli` instead of deprecated `cpx`
- Rollup-based bundling for ESM/CJS duality
- Peer dependency alignment and reproducibility guarantees

---

## 🚨 Migration Notice

The original `bigint-buffer` package is deprecated. This repo (`@gsknnft/bigint-buffer`) is the official, actively maintained successor. All users should migrate for security, performance, and modern features.

This repo — `@gsknnft/bigint-buffer@1.4.0` — is a **sovereign override**:
- ✅ Rebuilt with modern TypeScript and Rollup
- ✅ Native bindings patched and rebuilt via `node-gyp`
- ✅ Browser fallback formalized via `"browser"` field
- ✅ ESM/CJS duality declared via `"exports"`
- ✅ Peer dependency alignment and audit compliance restored

If you're using `bigint-buffer` in a secure or reproducible system, **migrate to `@gsknnft/bigint-buffer`** or override via `pnpm`:

```json
"pnpm": {
  "overrides": {
    "bigint-buffer": "@gsknnft/bigint-buffer@1.3.2"
  }
}
```

---

## Install
```bash
pnpm add @gsknnft/bigint-buffer
# or npm/yarn
```

---

## Quick Start
```ts
import {
  toBigIntBE, toBigIntLE, toBufferBE, toBufferLE,
  bigintToBuf, bufToBigint, bigintToHex, hexToBigint,
  bigintToText, textToBigint, bigintToBase64, base64ToBigint
} from '@gsknnft/bigint-buffer';

toBigIntBE(Buffer.from('deadbeef', 'hex')); // 3735928559n
toBufferLE(0xdeadbeefn, 6);                 // <Buffer ef be ad de 00 00>
bigintToHex(123456789n);                    // "075bcd15"
textToBigint('Hello');                      // 0x48656c6c6f
bigintToBase64(123456789n);                 // "B1vNFQ=="
```

---

### 🚀 Conversion Utilities (Built-In)

Need only the conversion helpers?
```ts
import * as conversion from '@gsknnft/bigint-buffer/conversion';
```

> All conversions are endian-safe, round-trip validated, and available in both Node and browser environments.

---

### 🧠 Why This Matters

- ✅ No audit vulnerabilities  
- ✅ Native bindings preserved  
- ✅ Conversion logic fused directly into the core  
- ✅ Unified types and exports  
- ✅ No need for `bigint-conversion` or external wrappers


---

## Runtime: Native vs JS
- Native binding lives at `build/Release/bigint_buffer.node` and loads automatically.
- Check the path in use:
  ```ts
  import { isNative } from '@gsknnft/bigint-buffer';
  console.log(isNative); // true when native is loaded
  ```
- Pure JS fallback stays available for browsers and non-native installs.

---

## Docs & Types
- Core usage: this README
- Full conversion docs: `src/conversion/docs/` (generated from `bigint-conversion`)
- API: [gsknnft.github.io/bigint-buffer/](https://gsknnft.github.io/bigint-buffer/)
- Types: ship in `dist/*.d.ts`

---

## Commands

```bash
pnpm run build           # compile + bundle
pnpm run test            # vitest (node + conversion tests)
pnpm run coverage        # conversion coverage
pnpm run rebuild:native  # rebuild the N-API binding
```

## Benchmarks

Run benchmarks with:
```bash
pnpm run benchmark       # performance benchmarks
```

---

## Modern Testing

Uses [Vitest](https://vitest.dev) for fast, type-safe tests and coverage:

```bash
pnpm run test      # run all tests
pnpm run coverage  # see coverage report
```

---

## API Surface
- Native: `toBigIntBE/LE`, `toBufferBE/LE`, `validateBigIntBuffer`, `isNative`
- Conversion: `bigintToBuf`, `bufToBigint`, `bigintToHex`, `hexToBigint`, `bigintToText`, `textToBigint`, `bigintToBase64`, `base64ToBigint`, `bufToHex`, `hexToBuf`, `textToBuf`, `bufToText`, `parseHex`, `TypedArray`

All helpers are endian-safe and validated across Node and browser builds.

---

## Support & Project Status
- Version: 1.4.0
- Maintainer: GSKNNFT/CoreFlame
- Node: ≥18 (native), browser bundle included
- Issues: https://github.com/gsknnft/bigint-buffer/issues
