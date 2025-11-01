import replace from '@rollup/plugin-replace';

export default {
    input: 'build/src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'esm'
    },
    external: ['bindings'],
    plugins: [
        replace({
            'process.browser': 'false'
        })
    ]
};