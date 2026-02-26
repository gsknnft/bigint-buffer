# Security Policy

## Reporting a Vulnerability

Please report vulnerabilities by opening a private security advisory on GitHub:

- https://github.com/gsknnft/bigint-buffer/security/advisories

If private advisory flow is unavailable, open an issue and request a secure contact channel.

## Supply Chain Notes

This package intentionally includes:

- Native addon artifacts (`*.node`) for performance-critical bigint/buffer conversion.
- Install-time script (`scripts/postinstall.cjs`) to ensure native availability when prebuilt artifacts are missing.

### What the postinstall script does

`scripts/postinstall.cjs` only:

- Reads environment variables to honor skip/force flags.
- Checks for presence of native binary under package-local `build/` and `dist/`.
- Optionally runs `node-gyp rebuild` in-place.

It does not intentionally:

- Perform network requests.
- Write outside the package directory.
- Modify git hooks or global shell/profile configuration.
- Exfiltrate local data.

## Verification Guidance

Before consuming a new release:

1. Inspect package tarball contents with `npm pack --dry-run`.
2. Review install script behavior in `scripts/postinstall.cjs`.
3. Validate production dependency advisories with `npm audit --omit=dev`.

