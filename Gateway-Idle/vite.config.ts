import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'Gateway-Idle'

// https://vite.dev/config/
export default defineConfig({
  base: `/${repositoryName}/`,
  plugins: [react(), tailwindcss()],
})
