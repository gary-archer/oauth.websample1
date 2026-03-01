import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import path from 'path';
import {defineConfig, RollupOptions} from 'rollup';
import copy from 'rollup-plugin-copy';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

const env = process.env.ROLLUP_WATCH === 'true' ? 'development' : 'production';
const dirname = process.cwd();
const options: RollupOptions = {

    input: './src/app/app.ts',
    output: {

        // Build ECMAScript modules to the dist folder
        dir: './dist/spa',
        format: 'esm',

        // Indicate the initial chunk that contains application source code
        entryFileNames: 'app.bundle.js',

        // Indicate chunks to output, which can include chunks created from dynamic imports
        chunkFileNames: '[name].bundle.js',

        // Define content for the fixed vendor chunk referenced in index.html
        manualChunks: (id: string) => {

            if (!id.includes('node_modules')) {
                return null;
            }

            return 'vendor';
        },

        // Enable source maps and update paths to support SPA debugging
        sourcemap: true,
        sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
            return path.resolve(path.dirname(sourcemapPath), relativeSourcePath);
        },
    },

    plugins: [

        // Use browser resolution for node_modules
        nodeResolve({
            browser: true,
        }),

        // Convert any commonjs libraries from the node_modules folder that the SPA's code depends upon
        commonjs(),

        // Use tslib and the typescript plugin with the settings from the tsconfig.json file
        // Also set the source root from the dist folder, to fix the relative paths supplied to sourcemapPathTransform
        typescript({
            sourceMap: true,
            sourceRoot: '../../',
        }),

        // Define 'environment variables' that will be present in the browser
        replace({
            'process.env.IS_DEBUG': env === 'development',
            preventAssignment: true,
        }),

        // During a TypeScript build, copy static files to the output folder
        copy({
            targets: [
                { src: './favicon.ico', dest: './dist' },
                { src: ['index.html', 'css/*'], dest: './dist/spa' },
                { src: './spa.config.json', dest: './dist/spa' },
            ],
        }),

        env === 'development' ? [

            // During development, if these files are directly edited, copy them to the output folder
            {
                name: 'watch-external',
                buildStart() {
                    this.addWatchFile(path.resolve(dirname, 'index.html'));
                    this.addWatchFile(path.resolve(dirname, 'css'));
                },
            },

            // Run a development static content server at an HTTPS URL
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

            // Live reload must listen on another HTTPS port to detect code changes
            livereload({
                watch: ['./dist/spa'],
                https: {
                    pfx: fs.readFileSync('../certs/authsamples-dev.ssl.p12'),
                    passphrase: 'Password1',
                },
            }),

        ] : [

            // Minify production bundles
            terser(),
        ],
    ],
};

export default defineConfig(options);
