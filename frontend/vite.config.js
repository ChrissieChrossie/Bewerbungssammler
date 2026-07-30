import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    watch: {
      // Docker-Bind-Mounts geben native Dateisystem-Events (v.a. von Windows-Hosts)
      // oft nicht zuverlässig weiter, daher Polling statt inotify.
      usePolling: true
    },
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
