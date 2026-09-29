import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy the API through the dev server so the browser only ever talks to its
    // own origin. That removes CORS from the picture entirely - it works whether
    // the app is opened on localhost, 127.0.0.1 or a LAN IP.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
