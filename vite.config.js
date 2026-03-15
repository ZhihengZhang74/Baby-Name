import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/element-plus')) {
            return 'element-plus'
          }
          if (id.includes('node_modules/element-china-area-data') || id.includes('node_modules/china-area-data')) {
            return 'china-area-data'
          }
          if (id.includes('node_modules/vue')) {
            return 'vue'
          }
        }
      }
    }
  }
})
