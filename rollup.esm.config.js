import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default {
    input: 'build/index.js',
    output: {
        file: 'dist/index.js',
        format: 'esm'
    },
    context: 'globalThis',
    external: ['bindings'],
    plugins: [
        polyfillNode(),
        commonjs({
            include: /node_modules/,
            namedExports: {
            }
        }),
        replace({
            preventAssignment: true,
            'process.browser': 'false'
        })
    ]
};
