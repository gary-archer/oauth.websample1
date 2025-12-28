import fs from 'fs';
import {ConfigEnv, defineConfig, UserConfig} from 'vite';

export default defineConfig((configEnv: ConfigEnv) => {

    const userConfig: UserConfig = {

        build: {
            minify: configEnv.mode === 'production',
            outDir: 'dist',
            sourcemap: true,
            rollupOptions: {
                input: './src/app/app.ts',
                output: {

                    entryFileNames: 'app.bundle.js',
                    chunkFileNames: '[name].bundle.js',
                    assetFileNames: '[name].bundle.js',
                    manualChunks: (id: string) => {
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }
                    },
                },
            }
        },
        define: {
            IS_DEBUG: `${configEnv.mode === 'development'}`
        },
        server: {
            port: 443,
            strictPort: true,
            https: {
                pfx: fs.readFileSync('../certs/authsamples-dev.ssl.p12'),
                passphrase: 'Password1',
            },
            open: 'https://www.authsamples-dev.com/spa'
        },
    };

    return userConfig;
});
