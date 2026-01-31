import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingoCompilerPlugin } from '@lingo.dev/compiler/vite';

export default defineConfig({
    plugins: [
        react(), 
        lingoCompilerPlugin({
            sourceRoot: 'src',
            sourceLocale: 'en',
            targetLocales: ['hi', 'bn', 'te', 'mr', 'ta', 'kn', 'gu', 'or', 'pa'],
            models: 'lingo.dev',
            dev: {
                usePseudotranslator: true,
            },
        })
    ],
    server: {
        port: 5173
    },
    css: {
        postcss: './postcss.config.js'
    }
});
