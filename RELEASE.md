# Release Runbook

This project publishes from the root package `@gsknnft/bigint-buffer`.

## Pre-release checks

Run from repo root:

```bash
npm ci
npm run build
npm run lint
npm run test
npm audit --omit=dev
npm pack --dry-run
```

Expected outcomes:
- build succeeds
- lint is clean
- all tests pass
- `npm audit --omit=dev` reports `0 vulnerabilities`
- tarball only contains publishable artifacts (`dist/`, native addon artifacts, docs, license)

## Versioning

1. Update `package.json` version.
2. Add release notes in `CHANGELOG.md` under a new version header.
3. Commit changes.
4. Create and push a tag:

```bash
git tag vX.Y.Z
git push origin main --tags
```

## Publish

```bash
npm publish --provenance --access public
```

## Post-publish verification

```bash
npm view @gsknnft/bigint-buffer version
npm view @gsknnft/bigint-buffer dist-tags --json
```

Then verify:
- npm package page shows the new version
- CI release workflow is green
- downstream consumers install and build successfully

## Notes

- Native addon is optional; pure JS fallback must always remain functional.
- Browser consumers still need a `Buffer` implementation in their bundler/runtime.
