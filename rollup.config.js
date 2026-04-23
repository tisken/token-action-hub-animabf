import terser from '@rollup/plugin-terser'
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
            sourcemap: true,
            inlineDynamicImports: true
        },
        plugins: [
            terser({ keep_classnames: true, keep_fnames: true }),
            multi()
        ],
        external: (id) => id.startsWith('/systems/')
    }
]
