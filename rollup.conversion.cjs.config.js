import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'build/conversion/index.js',
  output: {
    file: 'dist/conversion/index.cjs',
    format: 'cjs',
    exports: 'named'
  },
  context: 'globalThis',
  external: ['bindings'],
  plugins: [commonjs()]
};
