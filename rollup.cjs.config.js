import commonjs from '@rollup/plugin-commonjs';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default {
  input: 'build/index.js',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    exports: 'named'
  },
  context: 'globalThis',
  external: ['bindings'],
  plugins: [commonjs(), polyfillNode()]
};
