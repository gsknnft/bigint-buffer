import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default {
  input: 'build/conversion/index.js',
  output: {
    file: 'dist/conversion/index.js',
    format: 'esm'
  },
  context: 'globalThis',
  plugins: [
    polyfillNode(),
    commonjs({
      include: /node_modules/,
      namedExports: {
        'fs': ['fs'],
        'path': ['path'],
        'Buffer': ['Buffer']
      }
    }),
    replace({
      preventAssignment: true,
      'process.browser': 'false'
    })
  ]
};
