import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'build/src/index.js',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs'
  },
  external: ['bindings'], // Keep only bindings external as it's a native module
  plugins: [
    resolve(),
    commonjs()
  ]
}
