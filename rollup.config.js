import replace from 'rollup-plugin-replace';

export default {
    input: 'build/src/index.js',
    output: {
        file: 'dist/index.cjs',
        format: 'cjs'
    },
    exeternal: ['bindings'],
    plugins: [
        replace({
            'process.browser': process.env.BROWSER === "true"
        })
    ]
};