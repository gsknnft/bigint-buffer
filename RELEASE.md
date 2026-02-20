# Release 1.5.0
Date: 2026‑02‑20

## Highlights
- Hardened native loader behavior across Node/Electron/bundled runtime layouts.
- Unified loader logic to prevent drift between top‑level and conversion entrypoints.
- Expanded byte‑input support (`Buffer | Uint8Array | ArrayBuffer`) for endian conversion APIs.
- Improved JS fallback conversion performance with chunked operations.
- Reworked benchmark harness for deterministic, reproducible results.
- Significantly increased coverage with targeted runtime/fallback tests.
- Cleaned publish tarball to exclude bench/test artifacts and duplicate native payloads.

## Validation
- Tests: `141 passed`
- Coverage:
  - Statements: `84.15%`
  - Branches: `72.36%`
  - Functions: `88.37%`
  - Lines: `85.88%`
- Packaging: `npm pack --dry-run` clean for publishable artifacts.

## Release Checklist
1. `pnpm run build`
2. `pnpm test`
3. `pnpm run benchmark`
4. `npm pack --dry-run`
5. `git tag v1.5.0`
6. `npm publish`