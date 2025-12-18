import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'swiper/css': 'swiper/swiper.min.css',
      'swiper/css/navigation': 'swiper/modules/navigation.min.css',
      'swiper/css/pagination': 'swiper/modules/pagination.min.css',
      'swiper/css/scrollbar': 'swiper/modules/scrollbar.min.css'
    }
  }, // 👈 this comma was missing
  server: {
    port: 5004,
    allowedHosts: ["giafashion.io", "admin.giafashion.io"], // 👈 Added both
  },
  preview: {
    allowedHosts: ["giafashion.io", "admin.giafashion.io", "api.giafashion.io"], // 👈 Added both
  },
})

