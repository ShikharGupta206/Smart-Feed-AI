import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [react(), tailwindcss()],
  // In dev: proxy /api to local backend. In prod: VITE_API_URL env var is used by the app.
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8000' }
  }
}))
