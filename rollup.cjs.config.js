import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'build/index.js',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    exports: 'named'
  },
  context: 'globalThis',
  external: ['bindings', '@juanelas/base64'],
  plugins: [commonjs()]
};
