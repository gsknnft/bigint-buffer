# Security Policy

## Reporting a Vulnerability

Please report vulnerabilities by opening a private security advisory on GitHub:

- https://github.com/gsknnft/bigint-buffer/security/advisories

If private advisory flow is unavailable, open an issue and request a secure contact channel.

## Supply Chain Notes

This package intentionally includes:

- Native addon artifacts (`*.node`) for performance-critical bigint/buffer conversion.
- Optional native build tooling via explicit user action (`npm run rebuild`).

This package does not run install-time lifecycle scripts.

## Environment Variables

The package reads the following environment variables. Treat them with the same trust as the rest of the process environment — anyone who can set them can already influence process behavior.

- `BIGINT_BUFFER_NATIVE_PATH` — appended to the search path for the `bigint_buffer.node` native binding. If an attacker controls this variable they can cause the package to load and execute an arbitrary `.node` binary. **Do not propagate untrusted environment variables into Node processes that import this package.**
- `BIGINT_BUFFER_SILENT_NATIVE_FAIL` — suppress the warning printed when the native binding fails to load.
- `BIGINT_BUFFER_DEBUG` — enables verbose path-resolution logging. Do not enable in production; paths may be logged to wherever stdout is routed.

## Input-Size Considerations

The conversion helpers operate on arbitrary-precision `BigInt` values. Inputs of unbounded size can cause unbounded CPU or memory use:

- `toBufferBE(n, width)` and `toBufferLE(n, width)` enforce a `width` ceiling of 2^28 bytes (256 MiB). Calls above that throw `RangeError`. The same ceiling applies to `toBufferBEInto`/`toBufferLEInto`.
- `bigintToBuf(n)`, `bigintToHex(n)`, `bigintToBase64(n)`, `base64ToBigint(s)`, `hexToBigint(s)`, and `textToBigint(s)` do not bound their inputs. If you accept these inputs from untrusted sources, enforce your own size limits on the source string / bigint before calling.

## Native Addon Hardening

The N-API native addon ([src/bigint-buffer.c](src/bigint-buffer.c)) follows defensive practice:

- Every N-API call's return value is checked and surfaced as a JavaScript error on failure. Asserts are not relied upon (they compile out under `NDEBUG`).
- Arguments are type-validated (`napi_is_buffer`, `napi_typeof`) before use; type mismatches throw `TypeError`.
- `malloc()` results are NULL-checked; allocation failure throws `ENOMEM`.
- Empty inputs are handled at the function head before any pointer arithmetic.

If you ship a custom build of the native addon, please preserve these checks — the JS layer trusts the C side to either return a valid value or throw.

## Release Verification

Releases on npm are published with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) attestation. Verify with `npm view @gsknnft/bigint-buffer --json | jq '.dist.attestations'` before depending on a new version in production.

## Verification Guidance

Before consuming a new release:

1. Inspect package tarball contents with `npm pack --dry-run`.
2. Confirm there are no install-time scripts in `package.json`.
3. Validate production dependency advisories with `npm audit --omit=dev`.
4. Confirm npm provenance attestation is present on the published version.
