import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'build/index.js',
    output: {
        file: 'dist/index.js',
        format: 'esm'
    },
    context: 'globalThis',
    external: ['bindings'],
    plugins: [
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
