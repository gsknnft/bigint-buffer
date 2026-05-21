# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Changed
- Native addon internals (`src/bigint-buffer.c`) received an additional staging/alignment pass:
  - normalized stack staging constants (`STACK_TMP_BYTES` / `STACK_TMP_WORDS`)
  - removed dead macros/includes
  - hardened `toBigInt` aligned-word staging path
  - fixed `fromBigInt` staging-size logic to allocate/swap using full target width
- Test harness cleanup for Vitest hoist semantics: `vi.unmock(...)` moved to top-level in affected specs to avoid future hard errors.
- CI dependency install made deterministic by switching workflow installs to `npm ci`.
- Build/publish scripts made cross-platform by replacing shell `rm -rf` usage with Node `fs.rmSync(...)` cleanup scripts.

## [2.0.0] - 2026-05-20

Major release. ESM-only, single package, polyfill-free browser support, 100% line coverage, zero vulnerabilities.

### Added
- **Zero-allocation write API**: `toBufferBEInto(num, width, target, offset?)` and `toBufferLEInto(num, width, target, offset?)` write directly into a pre-allocated `Buffer` or `Uint8Array` (including subarrays with non-zero `byteOffset`). Bounds-checked, returns `bytesWritten`, inherits native acceleration when available.
- **256 MiB safety ceiling** on `width` for all buffer-allocating and buffer-writing entrypoints. Calls with `width > 2^28` throw `RangeError`, blocking DoS-by-allocation from hostile or buggy callers.
- **Real-browser test runtime**: `npm run test:browser` runs the public API against the actual `dist/index.js` in headless chromium via `@vitest/browser` + `playwright`. Catches Node-leak regressions that source-only Node tests miss.
- **npm provenance** at publish (`npm run publish:release` uses `--provenance --access public`).
- Expanded `SECURITY.md` covering env-var attack surface (`BIGINT_BUFFER_NATIVE_PATH` is a code-execution sink), input-size considerations for unbounded helpers, and release-verification guidance.

### Changed (Breaking)
- **ESM-only.** Dropped the CJS build (`dist/index.cjs`) and the UMD build. The `main`, `module`, and `exports.import` fields all point at the same `dist/index.js`. Consumers must use `import`, dynamic `import()`, or a bundler that handles ESM.
- **Flattened the `bigint-conversion` sub-package** into the root. The standalone `bigint-conversion` npm package is no longer published. All previously re-exported helpers (`bigintToBuf`, `bufToBigint`, `bigintToHex`, `bigintToBase64`, `parseHex`, `toFixedPoint`, etc.) remain available from `@gsknnft/bigint-buffer` and `@gsknnft/bigint-buffer/conversion`. Direct imports from the deep `dist/conversion/...` paths are gone.
- **Single browser-safe build.** Removed the separate `dist/index.browser.js` shim. The same `dist/index.js` works in Node and the browser; Node-only modules (`node:module`, `node:url`, `bindings`, `node-gyp-build`) are loaded via gated dynamic imports and tree-shake out of browser bundles.
- **Browser API surface in source matches Node.** Bundlers (Vite, Rollup, esbuild, webpack 5, Bun, Deno) no longer need `vite-plugin-node-polyfills` or similar to import this package.
- `engines.npm` raised from `>=9` to `>=10`, matching the floor for Node 20.

### Removed
- `dist/index.cjs`, `dist/index.umd.js`, `dist/conversion/cjs/*` — no CJS or UMD output.
- `dist/index.browser.js` — single browser-safe ESM build replaces it.
- `bigint-conversion@0.2.0` workspace package and the entire `src/conversion/` tree (sub-`package.json`, sub-rollup, sub-vite, sub-tsconfig, sub-node_modules).
- `vite-plugin-node-polyfills` (eliminated the `elliptic` / `crypto-browserify` / `node-stdlib-browser` chain of advisories).
- `@rollup/plugin-terser` and the minified browser bundle target (eliminated the `serialize-javascript` advisory chain).
- Legacy test stack: karma + 5 karma-* plugins, mocha, chai, puppeteer, ts-standard, ts-loader, ts-node, webpack, webpack-cli — all unused since the vitest migration.
- Dead build configs: `rollup.cjs.config.js`, `rollup.esm.config.js`, `rollup.conversion.{cjs,esm}.config.js`, `karma.conf.js`.
- `scripts/sync-conversion.ts` and `src/browser-entry.spec.ts` — the separate browser-entry generation step is obsolete.

### Security
- **31 vulnerabilities → 0** in the dependency tree (1 critical, 12 high, 10 moderate, 8 low → none).
- Fixed a real browser-crash bug in [src/converter.ts](src/converter.ts): top-level `import "node:module"` / `import "node:url"` previously executed before the `IS_BROWSER` guard ran, crashing any browser consumer who hit the source path through their own bundler. Now lifted into a gated dynamic import.
- Added the `width` safety ceiling described above.
- `prepublishOnly` now runs `npm test && npm audit --omit=dev` before publishing.
- **Native addon hardening pass** ([src/bigint-buffer.c](src/bigint-buffer.c)) — every `assert(status == napi_ok)` replaced with a `NAPI_CHECK` macro that throws a JavaScript error and returns. Asserts compile out under `NDEBUG`, so previously any N-API failure in a release build would proceed with garbage state (CWE-617 Reachable Assertion / CWE-754 Improper Check for Unusual or Exceptional Conditions). Other fixes in the same pass:
  - CWE-690 Unchecked Return for Null Pointer: `malloc()` results are checked; `ENOMEM` thrown on failure
  - CWE-704 Incorrect Type Conversion: arguments are type-validated via `napi_is_buffer` / `napi_typeof` before use (`TypeError` thrown on mismatch)
  - Edge cases: empty input (`len == 0` in `toBigInt`, `byte_width == 0` in `fromBigInt`) handled explicitly instead of relying on incidental behavior of downstream N-API calls
  - `init_all` propagates failures from every `napi_*` call instead of silently ignoring them

### Infrastructure
- **Tests moved from `src/` to `tests/`.** `src/` is code-only.
- **Benchmarks moved to `bench/`** (`bench/index.bench.ts`).
- Single `tsconfig.json` (was three across the workspace). Single `vitest.config.ts` with `node` and `browser` projects.
- Strict TypeScript flags enabled: `strict`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `isolatedModules`.
- ESLint flat config (`eslint.config.js`) with separate rule sets for source vs. test files.
- 100% line coverage, 100% function coverage across 187 Node tests + 8 chromium tests.

### Migration

Most consumers can upgrade with no code changes — the public API is unchanged. Three scenarios require attention:

- **CJS consumers** (`require("@gsknnft/bigint-buffer")`): switch to `import`. If you can't move to ESM, pin to `1.5.x`.
- **Direct imports from `@gsknnft/bigint-buffer/dist/conversion/...`**: these paths are gone. Use the public exports (`@gsknnft/bigint-buffer` or `@gsknnft/bigint-buffer/conversion`).
- **Anyone depending on `bigint-conversion` standalone**: that package is no longer published. The same API is available at `@gsknnft/bigint-buffer/conversion`.

## [1.5.1] - 2026-02-20

### Fixed
- Fixed browser bundler compatibility regression introduced in `1.5.0` where Vite/Rollup could resolve `bigint-buffer` to a non-browser-safe entry and fail on Solana named imports.
- Added a dedicated root browser ESM shim (`dist/index.browser.js`) that re-exports the browser conversion surface with stable named exports.
- Corrected conversion browser ESM output so `dist/conversion/esm/index.browser.js` emits real ESM named exports (not CommonJS-style `exports.*` assignments).
- Fixed browser runtime `Buffer is not defined` failures by explicitly importing `Buffer` in source paths consumed by browser builds.

### Changed
- Root package `browser` and `exports["."].browser` now target the browser-safe root shim instead of Node/UMD entries.
- Added regression coverage for browser entry packaging/export wiring to prevent future Vite/Solana breakage.

## [1.5.0] - 2026-02-20

### Added
- Added `tsconfig.declarations.json` to emit only publishable declarations.
- Added `pnpm-workspace.yaml` for pnpm workspace compatibility.

### Changed
- Improved native module resolution robustness for bundled/relocated installs.
- Optimized conversion fallback paths in `src/conversion` to use chunked byte operations instead of hex round-trips.
- Normalized declaration generation flow (`declare` script) to clean stale type artifacts before emit.
- Moved TypeScript build info output out of `dist` via `tsBuildInfoFile` to prevent publish noise.
- Restored browser export for `./conversion` subpath in package exports.
- Cleaned release documentation and runtime guidance (Node/Electron/browser/native fallback behavior).
- De-duplicated top-level loader logic to reuse shared converter loader path.
- Expanded byte-input compatibility (`Buffer | Uint8Array | ArrayBuffer`) for top-level and conversion endian APIs.
- Replaced flaky benchmark harness with deterministic `tsx`/`perf_hooks` runner and refreshed benchmark snapshots.

### Fixed
- Removed stale/duplicate publish artifacts from package file list and declaration output process.
- Reduced false native load misses in host-bundled runtime layouts by preferring explicit package-root/module-root probing.
- Raised full-suite LCOV to >80% lines with deterministic fallback/runtime branch tests.
- Removed emitted bench/test JS and duplicate conversion native payload from publish tarball output.
- Fixed conversion workspace post-build path alignment so CI can always generate `dist/cjs/index.node.js` and `dist/esm/index.node.js` stubs.
- Replaced `ts-node` invocation with `tsx` for root TypeScript build scripts to avoid ESM `.ts` extension failures on GitHub Actions.

## [1.4.7] - 2026-02-19

### Added
- Added FixedPoint helper exports and integrated conversion helpers at top-level package surface.

### Changed
- Shipped native binary with package and maintained JS fallback behavior.

## [1.4.6] - 2026-02-18

### Fixed
- Fixed import/build path issues in FixedPoint utilities.

## [1.4.5] - 2026-02-17

### Added
- Added FixedPoint utility family and initial native packaging updates.

## [1.4.4] - 2026-02-16

### Changed
- CI/release pipeline hardening and deterministic install flow.

## [1.4.3] - 2026-02-15

### Changed
- Project stewardship and stability updates.
