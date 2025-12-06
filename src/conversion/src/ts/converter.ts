let BufferImpl: typeof Buffer;
let path: typeof import("path") | undefined;
let fs: typeof import("fs") | undefined;

export const IS_BROWSER =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as { document?: unknown }).document !== "undefined";

if (!IS_BROWSER) {
  BufferImpl = require("buffer").Buffer;
  path = require("path");
  fs = require("fs");
} else {
  // Use buffer polyfill or fallback to Uint8Array for browser
  BufferImpl = require("buffer").Buffer;
}

export interface ConverterInterface {
  toBigInt: (buf: Buffer, bigEndian?: boolean) => bigint;
  fromBigInt: (num: bigint, buf: Buffer, bigEndian?: boolean) => Buffer;
}

export let isNative = false;
let converter: ConverterInterface | undefined;
let nativeLoadError: unknown;

if (!IS_BROWSER && path && fs) {
  const candidateRoots = [
    path.resolve(__dirname, "../../.."),
    path.resolve(__dirname, "../../../.."),
    path.resolve(__dirname, "../../../../.."),
  ];
  const findModuleRoot = (): string => {
    for (const root of candidateRoots) {
      const candidate = path.join(
        root,
        "build",
        "Release",
        "bigint_buffer.node"
      );
      if (fs.existsSync(candidate)) return root;
    }
    return candidateRoots[0];
  };
  try {
    const bindings = require("bindings");
    const moduleRoot = findModuleRoot();
    converter = bindings({
      bindings: "bigint_buffer",
      module_root: moduleRoot,
    }) as ConverterInterface;
    isNative = converter !== undefined;
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

if (!converter) {
  // fallback to pure JS if needed (browser or when native load fails)
  converter = {
    toBigInt: (buf: Buffer, bigEndian = true) => {
      const copy = BufferImpl.from(buf);
      if (!bigEndian) copy.reverse();
      const hex = copy.toString("hex");
      return hex.length === 0 ? 0n : BigInt(`0x${hex}`);
    },
    fromBigInt: (num: bigint, buf: Buffer, bigEndian = true) => {
      const hex = num.toString(16);
      const width = buf.length;
      const filled = hex.padStart(width * 2, "0").slice(0, width * 2);
      const tmp = BufferImpl.from(filled, "hex");
      if (!bigEndian) tmp.reverse();
      tmp.copy(buf);
      return buf;
    },
  };
}
