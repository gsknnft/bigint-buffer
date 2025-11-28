import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'build/index.js',
    output: {
        file: 'dist/index.js',
        format: 'esm'
    },
    context: 'globalThis',
    external: ['bindings', '@juanelas/base64'],
    plugins: [
        commonjs({
            include: /node_modules/,
            namedExports: {
                '@juanelas/base64': ['encode', 'decode']
            }
        }),
        replace({
            preventAssignment: true,
            'process.browser': 'false'
        })
    ]
};
