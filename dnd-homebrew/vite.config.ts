import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site needs: /REPO_NAME/
// BASE_PATH is set in the GitHub Actions workflow
const base = process.env.BASE_PATH || './'

export default defineConfig({
  plugins: [react()],
  base,
})
