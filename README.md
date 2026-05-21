# @gsknnft/bigint-buffer

[![NPM Version](https://img.shields.io/npm/v/@gsknnft/bigint-buffer.svg?style=flat-square)](https://www.npmjs.com/package/@gsknnft/bigint-buffer)
[![Node Version](https://img.shields.io/node/v/@gsknnft/bigint-buffer.svg?style=flat-square)](https://nodejs.org)

Modern, ESM-only BigInt <-> Buffer conversion with optional native acceleration, a zero-allocation write API, and built-in fixed-point and base-conversion helpers. Works in Node and browser builds from a single entry point.

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
  toBufferBEInto,
  toBufferLEInto,
  bigintToHex,
  hexToBigint,
  bigintToBase64,
  base64ToBigint,
} from "@gsknnft/bigint-buffer";

const value = toBigIntBE(Buffer.from("deadbeef", "hex"));
const out = toBufferLE(value, 8);

const hex = bigintToHex(123456789n); // "075bcd15"
const back = hexToBigint(hex);

const b64 = bigintToBase64(123456789n);
const fromB64 = base64ToBigint(b64);
```

## Zero-Allocation Writes (new in 2.0)

For hot paths (network framing, ring buffers, batch serialization), write directly into a pre-allocated target instead of returning a fresh `Buffer` each call:

```ts
import { toBufferBEInto, toBufferLEInto } from "@gsknnft/bigint-buffer";

const scratch = Buffer.alloc(1024);
let offset = 0;

for (const n of values) {
  offset += toBufferBEInto(n, 8, scratch, offset);
}
// scratch now contains all values BE-packed, zero per-iteration allocation.
```

The `*Into` family accepts `Buffer` or `Uint8Array` targets (including subarrays with non-zero `byteOffset`), bounds-checks the write region, returns the byte count written, and enforces a 256 MiB safety ceiling on `width` to fail loudly on hostile inputs.

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
const back = fromFixedPoint(sum, 9);
```

## Native Loading

By default the package is pure JS. A C++ N-API addon is available for maximum throughput on large buffers, but it is strictly optional and never required for correctness.

**Default (pure JS):** Node >= 20 provides `Buffer.readBigUInt64BE/LE` and `writeBigUInt64BE/LE` natively, so the pure-JS path is fast for normal payload sizes.

**Opt-in native:** Run `npm run rebuild` once in the package directory. On subsequent loads the runtime will find and use `build/Release/bigint_buffer.node` automatically.

```bash
npm run rebuild   # compiles the N-API addon and rebuilds dist
```

The loader tries:
1. `node-gyp-build` - looks for a prebuild or an already-compiled `.node`
2. `bindings` - resolves with an explicit `module_root`
3. Pure JS fallback (always available)

Override the search root with `BIGINT_BUFFER_NATIVE_PATH` (treat as code-execution-equivalent - see [SECURITY.md](SECURITY.md)). Enable verbose path logging with `BIGINT_BUFFER_DEBUG=1`, silence the fallback warning with `BIGINT_BUFFER_SILENT_NATIVE_FAIL=1`, or skip native install checks with `BIGINT_BUFFER_SKIP_NATIVE=1`.

## Browser Support

The same `dist/index.js` works in Node and browsers. Node-only imports (`node:module`, `node:url`, `bindings`) are gated behind `IS_BROWSER` detection and only loaded under Node.

```ts
// Vite / Rollup / esbuild / webpack 5 / Bun / Deno:
import { toBigIntBE, toBufferLE } from "@gsknnft/bigint-buffer";
```

Important: browser environments still need a `Buffer` implementation. Many toolchains provide one automatically, but Vite often requires explicit config.

Vite example:

```ts
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
});
```

## Electron

Native addon for the main process; pure JS fallback in the renderer.

- Main / preload (Node): `@gsknnft/bigint-buffer`
- Renderer (browser): `@gsknnft/bigint-buffer`

If your packager relocates `bigint_buffer.node`, set `BIGINT_BUFFER_NATIVE_PATH` to the directory containing `build/Release/bigint_buffer.node`. The typical asar-unpacked path is `resources/app.asar.unpacked/node_modules/@gsknnft/bigint-buffer/`.

## Exports

| Subpath | Purpose |
|---|---|
| `@gsknnft/bigint-buffer` | Full public API (BigInt<->Buffer, hex/base64/text helpers, fixed-point) |
| `@gsknnft/bigint-buffer/conversion` | Just the conversion helpers (no native loader surface) |
| `@gsknnft/bigint-buffer/build/Release/bigint_buffer.node` | Direct path to the native addon for custom packagers |

ESM-only. The published tarball contains a single `dist/index.js`, types, and the native addon. No CJS build.

## Scripts

```bash
npm test               # vitest run (node + browser projects)
npm run test:node      # node-only suite (vitest)
npm run test:browser   # real chromium via @vitest/browser + playwright
npm run coverage       # vitest --coverage (v8 provider)
npm run benchmark      # tsx bench/index.bench.ts
npm run build          # vite build + tsc + declarations + native sync
npm run rebuild        # node-gyp rebuild then build
npm run prebuilds      # prebuildify the native addon
npm run lint           # eslint (flat config)
npm run fix            # eslint --fix
```

## Quality Snapshot

- **Tests:** 195 passing
- **Coverage:** 100% lines, 97%+ functions
- **Vulnerabilities:** 0 (`npm audit`)
- **Dependencies:** 0 required runtime, 2 optional (native addon)

## Runtime Compatibility

- Node >= 20
- ESM-only (no CJS build)
- Native addon: N-API v3+ (`bigint_buffer.node`)
- Tested browsers: Chromium-latest via @vitest/browser

## Security

Reporting, environment-variable risks, input-size considerations, and provenance verification are documented in [SECURITY.md](SECURITY.md). Releases are published with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) attestations.

## Upgrading from 1.x

2.0.0 is ESM-only and removes the CJS build, the nested `bigint-conversion` sub-package, and the separate browser entry. See [CHANGELOG.md](CHANGELOG.md) for the migration notes.

## License

Apache-2.0
