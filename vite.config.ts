import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.svg', 'apple-touch-icon.svg'],
          manifest: {
            name: 'K-MIRROR AI — Global K-Beauty Stylist',
            short_name: 'K-MIRROR',
            description: 'AI-powered K-Beauty analysis and personalized styling',
            theme_color: '#0F0F0F',
            background_color: '#FFFFFF',
            display: 'standalone',
            scope: '/',
            start_url: '/',
            icons: [
              { src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
              { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
              { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,woff2}'],
            navigateFallback: '/index.html',
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
              },
            ],
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        }
      }
    };
});
