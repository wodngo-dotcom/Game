import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project from https://<user>.github.io/Game_store/,
  // so assets must be requested with that subpath prefix in production.
  base: command === 'build' ? '/Game_store/' : '/',
  plugins: [react()],
}))
