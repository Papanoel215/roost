import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // chemins relatifs : indispensable pour charger le build en file:// (Electron)
  base: './',
  plugins: [react()],
  server: {
    host: true,
  },
})
