import replace from '@rollup/plugin-replace';

export default {
  input: 'build/src/index.js',
  output: {
    format: 'esm',
    file: 'dist/node.js'
  },
  external: ['bindings'], // ← This is the fix
  plugins: [
    replace({
      preventAssignment: true,
      'process.browser': JSON.stringify(process.env.BROWSER === 'true')
    })
  ]
}