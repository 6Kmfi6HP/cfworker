import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://cfworkerback-pages5.pages.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Email, X-Auth-Key, X-Account-Context',
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       'vendor-react': ['react', 'react-dom'],
    //       'vendor-antd': ['antd', '@ant-design/icons'],
    //       'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
    //       'vendor-utils': ['axios', 'uuid', 'react-copy-to-clipboard', 'react-helmet']
    //     }
    //   }
    // }
  }
})
