/* eslint-disable @typescript-eslint/no-require-imports */

type PathModule = typeof import("path");
type FsModule = typeof import("fs");
type BindingsLoader = ((name: string) => unknown) &
  ((options: { bindings: string; module_root?: string }) => unknown);

export interface ConverterInterface {
  toBigInt: (buf: Buffer, bigEndian?: boolean) => bigint;
  fromBigInt: (num: bigint, buf: Buffer, bigEndian?: boolean) => Buffer;
}

export let isNative = false;

let converter: ConverterInterface | undefined;
let nativeLoadError: unknown;

export const IS_BROWSER =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as { document?: unknown }).document !== "undefined";

let path: PathModule | undefined = undefined;
let fs: FsModule | undefined = undefined;

// Only import Node.js modules in Node, never in browser/renderer
if (typeof process !== "undefined" && process.versions?.node && !IS_BROWSER) {
  path = require("path");
  fs = require("fs");
}

const resolvePackageRoot = (): string | undefined => {
  if (!path) return undefined;
  try {
    const pkgPath = require.resolve("@gsknnft/bigint-buffer/package.json");
    return path.dirname(pkgPath);
  } catch {
    return undefined;
  }
};

const candidateRoots = (): string[] => {
  if (!path) return [];
  const pkgRoot = resolvePackageRoot();
  const resourcesPath =
    typeof process !== "undefined" &&
    (process as { resourcesPath?: string }).resourcesPath;

  return [
    // explicit override
    process.env?.BIGINT_BUFFER_NATIVE_PATH,
    // installed package root
    pkgRoot,
    pkgRoot ? path.join(pkgRoot, "dist") : undefined,
    // electron packaged path (asar unpacked)
    resourcesPath
      ? path.join(
          resourcesPath,
          "app.asar.unpacked",
          "node_modules",
          "@gsknnft",
          "bigint-buffer"
        )
      : undefined,
    // when running from dist/
    path.resolve(__dirname, ".."),
    path.resolve(__dirname, "../.."),
    // when running from build/conversion/src/ts
    path.resolve(__dirname, "../../.."),
    // when running from src/conversion/src/ts
    path.resolve(__dirname, "../../../.."),
    // fallback to package root
    path.resolve(__dirname, "../../../../.."),
  ].filter((p): p is string => Boolean(p));
};

export const findModuleRoot = (): string | undefined => {
  if (!path || !fs) return undefined;
  for (const root of candidateRoots()) {
    const candidate = path.join(root, "build", "Release", "bigint_buffer.node");
    if (fs.existsSync(candidate)) {
      return root;
    }
  }
  return undefined;
};

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

export function loadNative(): ConverterInterface | undefined {
  try {
    const rawBindings = require("bindings");
    const bindings = resolveBindings(rawBindings);
    const moduleRoot = findModuleRoot();
    if (moduleRoot) {
      return bindings({
        bindings: "bigint_buffer",
        module_root: moduleRoot,
      }) as ConverterInterface;
    }
    return bindings("bigint_buffer") as ConverterInterface;
  } catch (err) {
    nativeLoadError = err;
    return undefined;
  }
}

if (!IS_BROWSER) {
  converter = loadNative();
  isNative = converter !== undefined;
  if (
    !isNative &&
    nativeLoadError !== undefined &&
    process.env?.BIGINT_BUFFER_SILENT_NATIVE_FAIL !== "1"
  ) {
    console.warn(
      "bigint-buffer: Failed to load native bindings; using pure JS fallback. Run npm run rebuild to restore native.",
      nativeLoadError
    );
  }
}

if (converter === undefined) {
  // fallback to pure JS if needed (browser or when native load fails)
  converter = {
    toBigInt: (buf: Buffer, bigEndian = true) => {
      const copy = Buffer.from(buf);
      if (!bigEndian) copy.reverse();
      const hex = copy.toString("hex");
      return hex.length === 0 ? 0n : BigInt(`0x${hex}`);
    },
    fromBigInt: (num: bigint, buf: Buffer, bigEndian = true) => {
      const hex = num.toString(16);
      const width = buf.length;
      const filled = hex.padStart(width * 2, "0").slice(0, width * 2);
      const tmp = Buffer.from(filled, "hex");
      if (!bigEndian) tmp.reverse();
      tmp.copy(buf);
      return buf;
    },
  };
}
