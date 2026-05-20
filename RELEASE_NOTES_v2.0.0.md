# v2.0.0 — ESM-only, polyfill-free browsers, hardened native, 100% covered

A full modernization pass. Same public API, leaner package, better security posture, real browser support.

## TL;DR

- **ESM-only.** CJS, UMD, and the separate browser build are gone — one `dist/index.js` works in Node and browsers.
- **No bundler polyfills needed.** Vite, Rollup, esbuild, webpack 5, Bun, Deno all import this without `vite-plugin-node-polyfills` or similar shims.
- **Zero-allocation write API:** `toBufferBEInto` / `toBufferLEInto` write into pre-allocated `Buffer` / `Uint8Array` targets.
- **31 vulnerabilities → 0** (1 critical, 12 high, 10 moderate, 8 low → none).
- **100% line coverage, 100% function coverage** across 187 Node tests + 8 real-chromium tests.
- **Native addon hardened** — 8 reachable assertions and 2 unchecked malloc paths fixed in `src/bigint-buffer.c`.
- **npm provenance** at publish.

## New API

```ts
import { toBufferBEInto, toBufferLEInto } from "@gsknnft/bigint-buffer";

const scratch = Buffer.alloc(1024);
let offset = 0;
for (const n of values) {
  offset += toBufferBEInto(n, 8, scratch, offset);
}
```

Accepts `Buffer` or `Uint8Array` targets (including subarrays with non-zero `byteOffset`). Bounds-checked, returns `bytesWritten`, inherits native acceleration when available, enforces a 256 MiB safety ceiling on `width`.

## Security

- Removed `vite-plugin-node-polyfills` — eliminated the `elliptic` / `crypto-browserify` / `node-stdlib-browser` advisory chain.
- Removed `@rollup/plugin-terser` and the minified bundle target — eliminated the `serialize-javascript` chain.
- Removed legacy unused test stack (karma, mocha, chai, puppeteer, webpack, ts-loader, ts-node, ...) — eliminated the rest.
- Fixed a real browser-crash bug: top-level `import "node:module"` / `import "node:url"` in `src/converter.ts` previously executed before the IS_BROWSER guard, crashing browser consumers who hit the source through their own bundler. Now lifted into gated dynamic imports.
- Added `width` safety ceiling (2^28 / 256 MiB) on `toBufferBE` / `toBufferLE` / `toBufferBEInto` / `toBufferLEInto`. Hostile or buggy callers can no longer DoS by allocation.
- Hardened the native N-API addon — every status check, type check, and allocation result is verified and surfaces as a thrown JS error. Asserts (which compile out under `NDEBUG`) are no longer relied upon.
- Releases are published with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) attestations. Verify with:
  ```bash
  npm view @gsknnft/bigint-buffer --json | jq '.dist.attestations'
  ```

## Breaking Changes

| Was | Now |
|---|---|
| `require("@gsknnft/bigint-buffer")` (CJS) | `import { ... } from "@gsknnft/bigint-buffer"` (ESM only) |
| Separate `dist/index.browser.js` | Single `dist/index.js` works everywhere |
| `bigint-conversion@0.2.0` standalone package on npm | Folded into `@gsknnft/bigint-buffer` and `@gsknnft/bigint-buffer/conversion` |
| Deep `dist/conversion/...` import paths | Removed — use the public exports |
| `engines.npm >= 9` | `engines.npm >= 10` |

Most consumers upgrade with no code changes. Public API is unchanged.

## Infrastructure

- Tests moved from `src/` to `tests/`. Benchmarks moved to `bench/`. `src/` is code-only.
- Single `tsconfig.json`, single `vitest.config.ts` (was three across the workspace).
- Strict TypeScript: `strict`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `isolatedModules`.
- ESLint flat config with separate source / test rule sets.
- Real-browser test runtime: `npm run test:browser` runs the public API in headless Chromium via `@vitest/browser` + `playwright`.

## Dependency Diff

- **Runtime:** `bindings`, `node-gyp-build` (unchanged)
- **DevDeps:** 42 → 16 entries pruned
- **Total `node_modules` packages:** ~553 → 241
- **Vulnerabilities:** 31 → 0

## Migration

Most consumers upgrade with no code changes. Three scenarios require attention:

1. **CJS consumers** (`require("@gsknnft/bigint-buffer")`): switch to `import`. If you can't move to ESM, pin to `1.5.x`.
2. **Direct imports from `@gsknnft/bigint-buffer/dist/conversion/...`**: these paths are gone. Use `@gsknnft/bigint-buffer` or `@gsknnft/bigint-buffer/conversion`.
3. **Anyone depending on `bigint-conversion@0.2.0`** standalone: no longer published. Same API at `@gsknnft/bigint-buffer/conversion`.

## Full Changelog

See [CHANGELOG.md](CHANGELOG.md#200---2026-05-20).
