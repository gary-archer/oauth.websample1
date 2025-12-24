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

                    entryFileNames: '[name].bundle.js',
                    chunkFileNames: '[name].bundle.js',

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
    };

    return userConfig;
});
