import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    resolve: {
        alias: {
            'ziggy-js': path.resolve(__dirname, 'vendor/tightenco/ziggy/dist/index.esm.js'),
            'tw-animate-css': path.resolve(__dirname, 'node_modules/tw-animate-css/dist/tw-animate.css'),
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
