import { fileURLToPath, URL } from "url"

import { defineConfig } from "vite"

export default defineConfig({
  base: "/tensorflowjs-class-cat-dog/",
  plugins: [
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})
