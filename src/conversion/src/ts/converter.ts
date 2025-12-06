import { Buffer } from 'buffer';
import path from 'path';
import fs from 'fs';

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

export const candidateRoots = [
  // when running from dist/
  path.resolve(__dirname, "../../"),
  // when running from build/conversion/src/ts
  path.resolve(__dirname, "../../.."),
  // when running from src/conversion/src/ts
  path.resolve(__dirname, "../../../../"),
];

export const findModuleRoot = (): string => {
  for (const root of candidateRoots) {
    const candidate = path.join(root, "build", "Release", "bigint_buffer.node");
    if (fs.existsSync(candidate)) return root;
  }
  return candidateRoots[0];
};

export function loadNative(): ConverterInterface | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bindings = require("bindings");
    const moduleRoot = findModuleRoot();
    return bindings({
      bindings: "bigint_buffer",
      module_root: moduleRoot,
    }) as ConverterInterface;
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
