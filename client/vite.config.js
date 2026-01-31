import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import { lingoCompiler } from '@lingo.dev/compiler';

export default defineConfig({
    plugins: [
        react(), tailwindcss(),
        lingoCompiler({
            apiKey: process.env.VITE_LINGO_API_KEY,
            sourceLanguage: 'en',
            targetLanguages: ['hi', 'bn', 'te', 'mr', 'ta', 'kn', 'gu', 'or', 'pa'],
            usePseudotranslator: true // Set to false in production
        })
    ],
    server: {
        port: 5173
    }
});
