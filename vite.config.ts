import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
