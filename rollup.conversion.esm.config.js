import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'build/conversion/index.js',
  output: {
    file: 'dist/conversion/index.js',
    format: 'esm'
  },
  context: 'globalThis',
  external: ['bindings', '@juanelas/base64'],
  plugins: [
    commonjs(),
    replace({
      preventAssignment: true,
      'process.browser': 'false'
    })
  ]
};
