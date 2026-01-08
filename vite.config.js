import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Redirect root to sidepanel.html in development
    open: '/sidepanel.html',
  },
  build: {
    rollupOptions: {
      input: {
        // Main entry for GitHub Pages
        index: 'index.html',
        // Side panel entry for Chrome extension
        sidepanel: 'sidepanel.html',
      },
    },
  },
})
