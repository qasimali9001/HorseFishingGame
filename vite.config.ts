import { defineConfig } from 'vite'

// base matches the GitHub Pages repo path so built asset URLs resolve correctly.
export default defineConfig({
  base: '/HorseFishingGame/',
  server: {
    open: true,
  },
  build: {
    target: 'es2020',
  },
})
