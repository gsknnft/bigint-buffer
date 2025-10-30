export default {
  input: 'build/src/index.js',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
  },
  external: ['bindings'],
};