import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), VitePWA({
        workbox: {
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
        },
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico'],
        manifest: {
            theme_color: '#2b303b',
            background_color: '#2b303b',
            icons: [
                {
                    src: 'icon512_maskable.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable'
                },
                {
                    src: 'icon512_rounded.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any'
                }
            ],
            orientation: 'any',
            display: 'fullscreen',
            lang: 'uk',
            name: 'BLACK',
            short_name: 'BLACK',
            start_url: '/',
            description: 'PWA BLACK',
            id: '/'
        },
        devOptions: {
            enabled: true
        }
    })
    ],
    resolve: {
        alias: {
            '@': '/src',
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
})