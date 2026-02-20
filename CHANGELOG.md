# Changelog

All notable changes to this project are documented in this file.

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
