#!/usr/bin/env node
'use strict';
const path = require('node:path');

if (process.env.BIGINT_BUFFER_SKIP_NATIVE === '1') {
  process.exit(0);
}

try {
  // Try to load a prebuilt binary (placed in prebuilds/ by `npm run prebuilds`).
  // node-gyp-build looks for a matching platform/arch binary in prebuilds/.
  require('node-gyp-build')(path.join(__dirname, '..'));
} catch {
  // No prebuilt binary for this platform — pure-JS fallback will be used.
  // Run `npm run rebuild` to compile the native addon from source.
}

// Always succeed. Native acceleration is optional.
process.exit(0);
