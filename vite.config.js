import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Use environment variable to switch between GitHub Pages and Chrome extension builds
// npm run build -> Chrome extension (base: './')
// npm run build:gh -> GitHub Pages (base: '/text-emoji/')
export default defineConfig(({ command, mode }) => {
  const isGitHubPages = process.env.BUILD_TARGET === 'gh-pages'

  return {
    plugins: [react()],
    // Use relative path for Chrome extension, absolute path for GitHub Pages
    base: isGitHubPages ? '/text-emoji/' : './',
    server: {
      // Redirect root to sidepanel.html in development
      open: '/sidepanel.html',
    },
    build: {
      // Output to different directories based on target
      outDir: isGitHubPages ? 'dist-gh' : 'dist',
      rollupOptions: {
        input: {
          // Main entry for GitHub Pages
          index: 'index.html',
          // Side panel entry for Chrome extension
          sidepanel: 'sidepanel.html',
        },
      },
    },
  }
})
