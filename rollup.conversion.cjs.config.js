import commonjs from '@rollup/plugin-commonjs';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default {
  input: 'build/conversion/index.js',
  output: {
    file: 'dist/conversion/index.cjs',
    format: 'cjs',
    exports: 'named'
  },
  context: 'globalThis',
  plugins: [polyfillNode(), commonjs()]
};
