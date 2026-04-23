import multi from '@rollup/plugin-multi-entry'

export default [
    {
        input: {
            include: ['scripts/*.js'],
            exclude: ['scripts/token-action-hud-animabf.min.js']
        },
        output: {
            format: 'esm',
            file: 'scripts/token-action-hud-animabf.min.js',
            sourcemap: true
        },
        plugins: [
            multi()
        ]
    }
]
