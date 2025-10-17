import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),

    // --- PWA Plugin ---
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: ' LEE FH',
        short_name: 'LEE  FH',
        description: 'Mortuary and funeral home management software',
        theme_color: '#06b10f',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'favicon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),

    // --- Compression Plugin ---
    viteCompression({
      verbose: true,        // log compressed files
      disable: false,
      threshold: 10240,     // only compress files >10kb
      algorithm: 'brotliCompress', // or 'gzip'
      ext: '.br',           // file extension for compressed files
    }),

    // Optional: gzip in addition to Brotli
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],

  build: {
    target: 'esnext',
    outDir: 'dist',
  },
});
