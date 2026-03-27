import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

// Use Bun's native env loading
const envPrefix = 'PUBLIC_';
const env: Record<string, string> = {};

// Load all PUBLIC_ prefixed env vars from Bun
for (const [key, value] of Object.entries(process.env)) {
  if (key.startsWith(envPrefix) && value !== undefined) {
    env[`process.env.${key}`] = JSON.stringify(value);
  }
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.svg'],
      manifest: {
        name: 'Ascend',
        short_name: 'Ascend',
        description: 'Ascend - Your Progressive Web Application',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  define: env,
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/convex/') || id.includes('/node_modules/convex-svelte/')) {
            return 'convex';
          }
        }
      }
    }
  }
});
