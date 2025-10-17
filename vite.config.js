import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Generate timestamp for build versioning
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Add timestamp to build output for versioning
    rollupOptions: {
      output: {
        // Add timestamp to chunk names for cache busting
        chunkFileNames: `assets/[name]-${timestamp}-[hash].js`,
        entryFileNames: `assets/[name]-${timestamp}-[hash].js`,
        assetFileNames: `assets/[name]-${timestamp}-[hash].[ext]`
      }
    }
  },
  // Add timestamp to define global constants
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(timestamp),
    __BUILD_VERSION__: JSON.stringify(`v1.0.0-${timestamp}`)
  }
})
