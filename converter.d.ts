import { Buffer } from 'buffer';
export interface ConverterInterface {
    toBigInt: (buf: Buffer, bigEndian?: boolean) => bigint;
    fromBigInt: (num: bigint, buf: Buffer, bigEndian?: boolean) => Buffer;
}
export declare let isNative: boolean;
export declare const IS_BROWSER: boolean;
export declare const candidateRoots: string[];
export declare const findModuleRoot: () => string;
export declare function loadNative(): ConverterInterface | undefined;
