import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/pyapi': {
        target: 'https://connectx-python-backend.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pyapi/, '')  // Fix this line
      }
    }
  }
})