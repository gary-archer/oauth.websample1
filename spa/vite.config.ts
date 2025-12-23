import {defineConfig} from 'vite';

export default defineConfig({
    build: {
        sourcemap: true,
        //minify: true,
        outDir: './dist',
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
    }
});
