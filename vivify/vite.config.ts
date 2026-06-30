import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(), // Fixes Error 1: Compiles your styles.css
    TanStackRouterVite(),
    react()
  ],
  resolve: {
    alias: {
      // Fixes Error 2: Tells Vite that @/ means the src/ folder
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5073',
        changeOrigin: true,
      }
    }
  }
})