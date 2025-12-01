# Changelog

## 1.4.3 — Stability & Stewardship

- Verified native bindings across Node 18–24 with npm-driven CI on Linux/macOS/Windows.
- Added npm-based release automation and kept manual trigger/permissions intact.
- Cleaned lint config after removing gts; ESLint now targets source/tests without linting built artifacts.
- Clarified README with npm instructions and fork status; removed corrupted text.
- Deprecated 1.4.1/1.3.x and documented the upgrade path to 1.4.3.

`1.4.3` is the stability beacon release: pin to this version to guarantee proper bindings, CI-backed builds, and active maintainership while the older `1.3.x` line is fully deprecated.
