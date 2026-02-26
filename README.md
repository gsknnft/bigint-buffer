# @gsknnft/bigint-buffer

[![NPM Version](https://img.shields.io/npm/v/@gsknnft/bigint-buffer.svg?style=flat-square)](https://www.npmjs.com/package/@gsknnft/bigint-buffer)
[![Node Version](https://img.shields.io/node/v/@gsknnft/bigint-buffer.svg?style=flat-square)](https://nodejs.org)

BigInt <-> Buffer conversion with native bindings, fast JS fallback paths, and built-in conversion helpers.

## Install

```bash
npm install @gsknnft/bigint-buffer
```

## Quick Start

```ts
import {
  toBigIntBE,
  toBigIntLE,
  toBufferBE,
  toBufferLE,
  bigintToHex,
  hexToBigint,
  bigintToBase64,
  base64ToBigint,
} from "@gsknnft/bigint-buffer";

const value = toBigIntBE(Buffer.from("deadbeef", "hex"));
const out = toBufferLE(value, 8);

const hex = bigintToHex(123456789n); // "075bcd15"
const roundTrip = hexToBigint(hex);

const b64 = bigintToBase64(123456789n);
const fromB64 = base64ToBigint(b64);
```

## FixedPoint Helpers

```ts
import {
  toFixedPoint,
  fromFixedPoint,
  addFixedPoint,
  subtractFixedPoint,
  averageFixedPoint,
  compareFixedPoint,
} from "@gsknnft/bigint-buffer";

const a = toFixedPoint(12.34, 9);
const b = toFixedPoint(7.66, 9);
const sum = addFixedPoint(a, b);
const avg = averageFixedPoint([a, b]);
const cmp = compareFixedPoint(a, b);
const n = fromFixedPoint(sum, 9);
```

## Native Loading

The package tries native first, then falls back to JS:

1. `node-gyp-build` prebuild lookup from installed package root
2. `bindings` lookup with explicit `module_root` when resolvable
3. pure JS fallback

Set `BIGINT_BUFFER_NATIVE_PATH` to override lookup root when needed.

Enable debug logging:

```bash
BIGINT_BUFFER_DEBUG=1 node your-app.js
```

Silence fallback warning:

```bash
BIGINT_BUFFER_SILENT_NATIVE_FAIL=1 node your-app.js
```

## Electron Packaging

Include the native binary in unpacked resources:

- `node_modules/@gsknnft/bigint-buffer/build/Release/bigint_buffer.node`

Common location at runtime:

- `resources/app.asar.unpacked/node_modules/@gsknnft/bigint-buffer/build/Release/bigint_buffer.node`

If your packager relocates native files, set `BIGINT_BUFFER_NATIVE_PATH` to the directory containing `build/Release/bigint_buffer.node`.

## Browser Notes

This package supports browser builds via a dedicated browser-safe root entry and conversion bundles.

Recommended browser import (works with Vite/Rollup and Solana packages that import `bigint-buffer`):

```ts
import { toBigIntBE, toBigIntLE, toBufferBE, toBufferLE } from "@gsknnft/bigint-buffer";
```

The package routes browser bundlers to `dist/index.browser.js`, which re-exports the browser conversion implementation and avoids Node-only imports (`node:*`, native loader paths).

If you want the browser-only surface explicitly, you can also import:

```ts
import { toBigIntBE, toBigIntLE, toBufferBE, toBufferLE } from "@gsknnft/bigint-buffer/conversion";
```

Electron usage guidance:

- Main / preload (Node context): `@gsknnft/bigint-buffer`
- Renderer (browser context): `@gsknnft/bigint-buffer` or `@gsknnft/bigint-buffer/conversion`

The browser-safe root entry is designed to avoid Node-only imports in browser bundles.

If you are upgrading from `1.5.0` and still see browser build/runtime errors, clear bundler caches and reinstall:

```bash
rm -rf node_modules/.vite
pnpm install
```

## Exports

Top-level package exports:

- ESM: `dist/index.js`
- CJS: `dist/index.cjs`
- Types: `dist/index.d.ts`
- Native binary export: `./build/Release/bigint_buffer.node`
- Conversion subpath: `@gsknnft/bigint-buffer/conversion`

## Commands

```bash
npm run build        # bundle + declarations + conversion sync + native sync
npm run compile      # build + typecheck
npm test             # vitest
npm run check        # eslint
npm run rebuild      # node-gyp rebuild + build + conversion build
npm run prebuilds    # prebuildify for native binaries
```

Internal build scripts (`scripts/*.ts`) are executed via `tsx` for stable ESM compatibility in local and CI environments.

## Version Note

- `1.5.0` introduced major runtime/packaging improvements but had a browser bundler export regression in some Vite/Rollup + Solana setups.
- Upgrade to `1.5.1+` for the browser-safe root entry fix.

## Quality Snapshot

Latest local run (Node 24, Vitest v4, v8 coverage):

- Tests: `141 passed`
- Coverage: `Statements 84.15%`, `Branches 72.36%`, `Functions 88.37%`, `Lines 85.88%`
- Benchmark snapshot: see `benchmark.md`
- Publish dry-run: clean tarball (no test/bench JS artifacts)

Reproduce:

```bash
pnpm exec vitest run --coverage --pool=forks
pnpm run benchmark
pnpm pack --dry-run
```

## Runtime Compatibility

- Node: `>=20`
- Package format: ESM + CJS
- Native addon: N-API (`bigint_buffer.node`)

## Security

Security policy and supply-chain notes are documented in `SECURITY.md`.

## License

Apache-2.0
