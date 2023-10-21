import { defineConfig } from 'rollup';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import scss from 'rollup-plugin-scss';
import terser from '@rollup/plugin-terser';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

const dir = 'dist';
const name = 'Alwan';
const devDir = 'test';

/**
 * @type {InputOption}
 */
const input = {
    alwan: 'src/index.ts',
};

/**
 * Creates an output array for a file format with two builds one minified,
 * and the other is not.
 *
 * @param {ModuleFormat} format - Build file format.
 * @param {string} prefix - Prefix the file name.
 * @returns {OutputOptions[]}- output build options.
 */
function build(format, prefix) {
    return [false, true].map((minified) =>
        Object.assign(
            {
                dir,
                format,
                entryFileNames: `${prefix}[name]${minified ? '.min' : ''}.js`,
            },
            minified
                ? {
                      sourcemap: true,
                      plugins: [
                          terser({
                              mangle: {
                                  properties: {
                                      regex: /^_/,
                                  },
                              },
                          }),
                      ],
                  }
                : {},
            format === 'umd' ? { name } : {}
        )
    );
}

export default defineConfig(({ watch }) => {
    const babelOptions = watch ? { targets: 'defaults' } : {};
    const scssOptions = watch
        ? { fileName: 'css/alwan.css' }
        : {
              fileName: 'css/alwan.min.css',
              sourceMap: true,
              outputStyle: 'compressed',
          };

    const plugins = [
        json({ preferConst: true }),
        nodeResolve({ extensions: '.ts' }),
        babel({
            babelHelpers: 'bundled',
            presets: [['@babel/env', { bugfixes: true }], '@babel/typescript'],
            extensions: ['.ts'],
            ...babelOptions,
        }),
        scss(scssOptions),
    ];

    if (watch) {
        // Development configuration.
        return {
            input,
            output: {
                dir: devDir,
                format: 'iife',
                name,
                entryFileNames: 'js/[name].js',
                sourcemap: 'inline',
            },
            plugins: [...plugins, serve({ contentBase: devDir, port: 8080 }), livereload(devDir)],
            watch: {
                include: ['src/**'],
                clearScreen: true,
            },
        };
    }

    // Production configuration.
    return {
        input,
        output: [...build('es', 'js/esm/'), ...build('umd', 'js/')],
        plugins,
    };
});
