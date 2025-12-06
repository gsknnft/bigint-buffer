
# Changelog

# UnReleased

## Conversion Performance (Unreleased)
- JS BE/LE converters now use chunked Buffer.read/writeBigUInt64* (with manual fallback) instead of hex string round-trips, removing extra allocations and copies.
- `toBuffer*`/`toBigInt*` share the same zero-allocation paths as the native binding, preserving low-order bytes and handling empty through very large buffers consistently.
- README now documents the optimized, size-agnostic conversions and the expanded test coverage across buffer sizes and environments.
- Documented browser polyfill requirements for `buffer`, `path`, and `fs` plus guidance on using native/SIMD paths when extreme throughput is needed.

## 1.4.6 — Import/Build Fixes
- Fixed import path issues in FixedPoint utilities (no more unresolved #pkg errors)
- Cleaned up build artifacts and ensured all exports resolve correctly
- All tests and CI green
- Users should upgrade to avoid runtime errors in 1.4.5

# Released 

## 1.4.5 — FixedPoint, Native Bindings, JS Fallback - (ISSUES WITH ARTIFACTS)

- Added FixedPoint utilities: `toFixedPoint`, `fromFixedPoint`, `addFixedPoint`, `subtractFixedPoint`, `averageFixedPoint`, `compareFixedPoint`, and `FixedPoint` type.
- Native bindings (`build/Release/bigint_buffer.node`) now included out-of-the-box in npm package.
- Improved JS fallback for environments without native bindings.
- CI-verified for Node 20–24 on all platforms.

## 1.4.4 — CI-Verified

- Built and published under the green CI matrix (Node 20–24 across ubuntu/macos/windows).
- Switched workflows to `npm ci` for deterministic installs.
- No code changes from 1.4.3; this formalizes the verified pipeline.

## 1.4.3 — Stability & Stewardship

- Verified native bindings across Node 18–24 with npm-driven CI on Linux/macOS/Windows.
- Added npm-based release automation and kept manual trigger/permissions intact.
- Cleaned lint config after removing gts; ESLint now targets source/tests without linting built artifacts.
- Clarified README with npm instructions and fork status; removed corrupted text.
- Deprecated 1.4.1/1.3.x and documented the upgrade path to 1.4.3.
- Tagged before the final green CI run; superseded by 1.4.4 for verified status.

`1.4.3` is the stability beacon release: pin to this version to guarantee proper bindings, CI-backed builds, and active maintainership while the older `1.3.x` line is fully deprecated.
