import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
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
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: [
            'favicon-evq/favicon.ico',
            'favicon-evq/favicon.svg',
            'favicon-evq/apple-touch-icon.png',
            'favicon-evq/favicon-96x96.png',
            'favicon-evq/web-app-manifest-192x192.png',
            'favicon-evq/web-app-manifest-512x512.png'
          ],
          manifest: {
            name: 'Revision - Kindle Highlights',
            short_name: 'Revision',
            description: 'Study your Kindle highlights with spaced repetition',
            theme_color: '#000000',
            background_color: '#FAFAFA',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: '/favicon-evq/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: '/favicon-evq/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'supabase-api',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60
                  }
                }
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            // Split large dependencies into separate chunks for better caching
            manualChunks: {
              'supabase': ['@supabase/supabase-js'],
              'router': ['react-router-dom'],
              'radix': ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
              'lucide': ['lucide-react'],
            }
          }
        },
        chunkSizeWarningLimit: 600, // Warn for chunks > 600KB
        sourcemap: false, // Disable source maps in production for smaller bundle
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            dead_code: true,
            unused: true,
          }
        }
      }
    };
});
