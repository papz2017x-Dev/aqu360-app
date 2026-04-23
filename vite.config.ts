import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'a360.png'],
      manifest: {
        name: 'Aqu360 App',
        short_name: 'Aqu360',
        description: 'Premium Water Refilling Management System',
        theme_color: '#0284c7',
        icons: [
          {
            src: 'a360.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'a360.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
