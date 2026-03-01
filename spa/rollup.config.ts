import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import {defineConfig, RollupOptions} from 'rollup';
import copy from 'rollup-plugin-copy';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

const env = process.env.ROLLUP_WATCH === 'true' ? 'development' : 'production';
const options: RollupOptions = {

    input: './src/app/app.ts',
    output: {

        // Build ECMAScript modules to the dist folder
        dir: './dist/spa',
        format: 'esm',
        sourcemap: true,

        // Indicate the initial chunk that contains application source code
        entryFileNames: 'app.bundle.js',

        // Indicate chunks to output, which can include chunks created from dynamic imports
        chunkFileNames: '[name].bundle.js',

        // Indicate fixed vendor chunks referenced in index.html
        manualChunks: (id: string) => {

            if (!id.includes('node_modules')) {
                return null;
            }

            return 'vendor';
        },
    },

    plugins: [

        // Use browser resolution for node_modules
        nodeResolve({
            browser: true,
        }),

        // Handle any commonjs libraries in the mode_modules folder
        commonjs(),

        // Use tslib and the typescript plugin with the settings from the configuration file
        typescript(),

        // Define 'environment variables' that will be present in the browser
        replace({
            'process.env.IS_DEBUG': env === 'development',
            preventAssignment: true,
        }),

        // Copy other static files to the output folder
        copy({
            targets: [
                { src: '../favicon.ico', dest: './dist' },
                { src: ['index.html', 'css/*'], dest: './dist/spa' },
                { src: './spa.config.json', dest: './dist/spa' },
            ],
        }),

        env === 'production' ? [

            // Minify production bundles
            terser(),
        ] : [

            // Run a development static content server
            serve({
                port: 443,
                host: 'www.authsamples-dev.com',
                https: {
                    pfx: fs.readFileSync('../certs/authsamples-dev.ssl.p12'),
                    passphrase: 'Password1',
                },
                open: true,
                openPage: '/spa',
                historyApiFallback: '/spa/index.html',
                contentBase: './dist',
            }),

            // Reload on code changes
            livereload({
                watch: ['./dist/spa'],
            }),
        ],
    ],
};

export default defineConfig(options);
