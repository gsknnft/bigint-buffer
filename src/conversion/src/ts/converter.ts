/* eslint-disable @typescript-eslint/no-require-imports */

export type PathModule = typeof import("path");
export type FsModule = typeof import("fs");
export type BindingsLoader = ((name: string) => unknown) &
  ((options: { bindings: string; module_root?: string }) => unknown);

export interface ConverterInterface {
  toBigInt: (buf: Buffer, bigEndian?: boolean) => bigint;
  fromBigInt: (num: bigint, buf: Buffer, bigEndian?: boolean) => Buffer;
}

export let isNative = false;
let nativeLoadError: unknown;

export const IS_BROWSER =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as { document?: unknown }).document !== "undefined";

let path: PathModule | undefined;
let fs: FsModule | undefined;

// Only import Node.js modules in Node, never in browser/renderer
if (typeof process !== "undefined" && process.versions?.node && !IS_BROWSER) {
  path = require("path");
  fs = require("fs");
}

/* c8 ignore start */
const resolvePackageRoot = (): string | undefined => {
  if (!path || !fs) return undefined;

  let searchDir = __dirname;
  while (true) {
    const nmCandidate = path.join(
      searchDir,
      "node_modules",
      "@gsknnft",
      "bigint-buffer",
      "package.json"
    );
    if (fs.existsSync(nmCandidate)) {
      return path.dirname(nmCandidate);
    }
    const parent = path.dirname(searchDir);
    if (parent === searchDir) break;
    searchDir = parent;
  }

  const canResolve =
    typeof require === "function" &&
    typeof (require as unknown as { resolve?: unknown }).resolve === "function";

  const tryResolve = (id: string): string | undefined => {
    if (!canResolve) return undefined;
    try {
      return (require as unknown as { resolve: (id: string) => string }).resolve(id);
    } catch {
      return undefined;
    }
  };

  const entry =
    tryResolve("@gsknnft/bigint-buffer") ??
    tryResolve("@gsknnft/bigint-buffer/dist/index.cjs") ??
    tryResolve("@gsknnft/bigint-buffer/dist/index.js");

  let dir = entry ? path.dirname(entry) : __dirname;
  while (true) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return undefined;
};
/* c8 ignore stop */

/* c8 ignore start */
const candidateRoots = (): string[] => {
  if (!path) return [];

  const seen = new Set<string>();
  const add = (candidate: string | undefined | null) => {
    if (!candidate) return;
    const normalized = path.resolve(candidate);
    if (!seen.has(normalized)) {
      seen.add(normalized);
    }
  };

  const pkgRoot = resolvePackageRoot();
  const resourcesPath =
    typeof process !== "undefined" &&
    (process as { resourcesPath?: string }).resourcesPath;

  // explicit override
  add(process.env?.BIGINT_BUFFER_NATIVE_PATH);

  // installed package root and its dist output
  add(pkgRoot);
  add(pkgRoot ? path.join(pkgRoot, "dist") : undefined);

  // electron packaged path (asar unpacked)
  add(
    resourcesPath
      ? path.join(
          resourcesPath,
          "app.asar.unpacked",
          "node_modules",
          "@gsknnft",
          "bigint-buffer"
        )
      : undefined
  );

  // relative to compiled artifacts or source
  add(path.resolve(__dirname, ".."));
  add(path.resolve(__dirname, "../.."));
  add(path.resolve(__dirname, "../../.."));
  add(path.resolve(__dirname, "../../../.."));
  add(path.resolve(__dirname, "../../../../.."));

  const roots = Array.from(seen);
  if (process.env.BIGINT_BUFFER_DEBUG) {
    console.log("bigint-buffer: candidateRoots:", roots);
  }
  return roots;
};

export const findModuleRoot = (): string | undefined => {
  if (!path || !fs) return undefined;
  for (const root of candidateRoots()) {
    const candidate = path.join(root, "build", "Release", "bigint_buffer.node");
    if (process.env.BIGINT_BUFFER_DEBUG) {
      console.log("bigint-buffer: checking for native at", candidate);
    }
    if (fs.existsSync(candidate)) {
      if (process.env.BIGINT_BUFFER_DEBUG) {
        console.log("bigint-buffer: found native at", candidate);
      }
      return root;
    }
    const distCandidate = path.join(
      root,
      "dist",
      "build",
      "Release",
      "bigint_buffer.node"
    );
    if (process.env.BIGINT_BUFFER_DEBUG) {
      console.log("bigint-buffer: checking for native at", distCandidate);
    }
    if (fs.existsSync(distCandidate)) {
      if (process.env.BIGINT_BUFFER_DEBUG) {
        console.log("bigint-buffer: found native at", distCandidate);
      }
      return path.join(root, "dist");
    }
  }
  if (process.env.BIGINT_BUFFER_DEBUG) {
    console.warn(
      "bigint-buffer: native binary not found in any candidate root"
    );
  }
  return undefined;
};
/* c8 ignore stop */

const resolveBindings = (candidate: unknown): BindingsLoader => {
  if (typeof candidate === "function") {
    return candidate as BindingsLoader;
  }
  if (candidate && typeof candidate === "object") {
    const maybeDefault = (candidate as { default?: unknown }).default;
    if (typeof maybeDefault === "function") {
      return maybeDefault as BindingsLoader;
    }
    if (
      maybeDefault &&
      typeof maybeDefault === "object" &&
      typeof (maybeDefault as { default?: unknown }).default === "function"
    ) {
      return (maybeDefault as { default: unknown }).default as BindingsLoader;
    }
  }
  throw new TypeError("bindings is not a function");
};

/* c8 ignore start */
const loadWithNodeGypBuild = (): ConverterInterface | undefined => {
  if (!path) return undefined;
  try {
    const load = require("node-gyp-build") as (
      dir: string
    ) => ConverterInterface;
    const pkgRoot = resolvePackageRoot();
    if (!pkgRoot) return undefined;
    return load(pkgRoot);
  } catch (err) {
    nativeLoadError = err;
    return undefined;
  }
};

export function loadNative(): ConverterInterface | undefined {
  nativeLoadError = undefined;
  // Prefer node-gyp-build (supports prebuilds) and fall back to bindings.
  const fromNodeGypBuild = loadWithNodeGypBuild();
  if (fromNodeGypBuild) return fromNodeGypBuild;

  try {
    const rawBindings = require("bindings");
    const bindings = resolveBindings(rawBindings);
    const pkgRoot = resolvePackageRoot();
    const moduleRoot = findModuleRoot() ?? pkgRoot;
    if (moduleRoot) {
      return bindings({
        bindings: "bigint_buffer",
        module_root: moduleRoot,
      }) as ConverterInterface;
    }

    return bindings("bigint_buffer") as ConverterInterface;
  } catch (err) {
    nativeLoadError = err;
    isNative = false;
    if (process.env?.BIGINT_BUFFER_SILENT_NATIVE_FAIL !== "1") {
      console.warn(
        "bigint-buffer: Failed to load native bindings; using pure JS fallback. Run npm run rebuild to restore native.",
        nativeLoadError
      );
    }
  }
}
/* c8 ignore stop */
