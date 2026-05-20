# Social Copy — v2.0.0

## Short (X / Bluesky / Mastodon) — 250 chars

```
@gsknnft/bigint-buffer 2.0.0 is out 🚀

— ESM-only, single file for Node + browsers
— Zero polyfills needed for Vite/Rollup/esbuild/Bun
— New zero-allocation write API (toBufferBEInto)
— 31 vulns → 0
— 100% line coverage
— Native addon hardened

https://github.com/gsknnft/bigint-buffer/releases/tag/v2.0.0
```

## Slightly longer (X thread / LinkedIn post)

```
Shipped @gsknnft/bigint-buffer 2.0.0 — a complete modernization of the BigInt ↔ Buffer fork.

What changed:

🪶 ESM-only. One dist/index.js works in Node AND browsers. No vite-plugin-node-polyfills needed for Vite/Rollup/esbuild/webpack 5/Bun/Deno.

⚡ New zero-allocation API:
  toBufferBEInto(num, 8, scratch, offset)
  toBufferLEInto(num, 8, scratch, offset)
Writes into your pre-allocated Buffer / Uint8Array. Returns bytesWritten. Great for serialization hot paths.

🛡️ Security:
  • 31 vulnerabilities → 0 (1 critical, 12 high, 10 moderate, 8 low → none)
  • Native N-API addon hardened (no more silent NDEBUG-stripped asserts)
  • 256 MiB width safety ceiling on every write entrypoint
  • npm provenance attestation at publish

🧪 Quality:
  • 100% line coverage / 100% function coverage
  • 187 Node tests + 8 real-chromium tests (via @vitest/browser + playwright)
  • 0 vulns, 2 runtime deps, 16 devDeps

The standalone bigint-conversion subpackage is folded into the main package. The CJS build is gone. Public API unchanged — most consumers upgrade with no code changes.

Notes + migration: https://github.com/gsknnft/bigint-buffer/releases/tag/v2.0.0
```

## Hacker News (Show HN / Releases) — title + first comment

**Title:**

```
@gsknnft/bigint-buffer 2.0 — ESM-only BigInt/Buffer with zero-alloc writes and hardened N-API addon
```

**First comment (context):**

```
Author here. This is a long-running fork of bigint-buffer, originally
modernized after the upstream went unmaintained and shipped a memory
disclosure (CVE-2025-3194). 2.0 collapses the legacy two-package layout
into one, drops CJS/UMD, removes vite-plugin-node-polyfills (and the
elliptic/crypto-browserify advisory chain it dragged in), and adds a
zero-allocation write API that mirrors Node's Buffer.write* convention
for callers that want to fill a scratch buffer instead of allocating
per call.

The native N-API addon got a defensive pass too — every
`assert(napi_ok)` (which compiles out under NDEBUG) is now an explicit
status check that throws a real JS error. Arguments are type-validated
before use; malloc failures throw ENOMEM instead of dereferencing NULL.

Released with npm provenance attestation. Verify with:
  npm view @gsknnft/bigint-buffer --json | jq '.dist.attestations'
```

## Reddit (/r/node, /r/javascript) — title + body

**Title:**

```
Released bigint-buffer 2.0 — ESM-only, polyfill-free in browsers, hardened native addon (0 vulns)
```

**Body:**

```
Major release of my modernized fork of bigint-buffer:

**What you get**

- ESM-only single build. Same `dist/index.js` works in Node and browsers — no Vite/Rollup polyfill plugins needed.
- New zero-allocation `toBufferBEInto(num, width, target, offset)` for hot serialization paths.
- 256 MiB safety ceiling on `width` so a hostile caller can't `toBufferBE(0n, 2**31)` you into OOM.
- N-API native addon hardened: every `assert(napi_ok)` (which compiles out under NDEBUG, leaving release builds with no error handling) replaced with explicit status checks.
- 31 → 0 vulnerabilities by dropping the legacy test stack + `vite-plugin-node-polyfills`'s elliptic chain.
- 100% line / function coverage. Real-browser tests in headless Chromium.
- Published with npm provenance attestation.

**Breaking**

- CJS build removed. ESM only.
- The standalone `bigint-conversion@0.2.0` subpackage is no longer published; same API lives at `@gsknnft/bigint-buffer/conversion`.
- Deep `dist/conversion/*` imports gone — use the public exports.

Public API is unchanged otherwise. Most consumers upgrade with no code changes.

Repo: https://github.com/gsknnft/bigint-buffer
Release notes: https://github.com/gsknnft/bigint-buffer/releases/tag/v2.0.0
```

## Discord / Slack channel announcement — informal

```
🚀 bigint-buffer 2.0.0 is out

big things:
• ESM-only, no bundler polyfills needed for Vite/Rollup/Bun/Deno
• new zero-alloc API for hot serialization loops
• 31 vulns → 0
• 100% test coverage
• native addon hardened (no more asserts that vanish in release)

drop-in for most folks — public API didn't change. release notes:
https://github.com/gsknnft/bigint-buffer/releases/tag/v2.0.0
```
