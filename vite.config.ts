import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['papaparse', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'papaparse', 'zustand'],
  },
})
