import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'build/src/index.js',
  output: {
    format: 'esm',
    file: 'dist/node.js',
    exports: 'named',
    preserveModules: false,
    outro: `
// Re-export all named exports from srcExports
export const isNative = srcExports.isNative;
export const toBigIntLE = srcExports.toBigIntLE;
export const validateBigIntBuffer = srcExports.validateBigIntBuffer;
export const toBigIntBE = srcExports.toBigIntBE;
export const toBufferLE = srcExports.toBufferLE;
export const toBufferBE = srcExports.toBufferBE;
export const parseHex = srcExports.parseHex;
export const bigintToBuf = srcExports.bigintToBuf;
export const bufToBigint = srcExports.bufToBigint;
export const bigintToHex = srcExports.bigintToHex;
export const hexToBigint = srcExports.hexToBigint;
export const bigintToText = srcExports.bigintToText;
export const textToBigint = srcExports.textToBigint;
export const bufToText = srcExports.bufToText;
export const textToBuf = srcExports.textToBuf;
export const bufToHex = srcExports.bufToHex;
export const hexToBuf = srcExports.hexToBuf;
export const bigintToBase64 = srcExports.bigintToBase64;
export const base64ToBigint = srcExports.base64ToBigint;
`
  },
  external: ['bindings'], // Keep only bindings external as it's a native module
  plugins: [
    resolve(),
    commonjs({
      requireReturnsDefault: 'namespace',
      defaultIsModuleExports: false,
      esmExternals: true
    }),
    replace({
      preventAssignment: true,
      'process.browser': JSON.stringify(process.env.BROWSER === 'true')
    })
  ]
}
