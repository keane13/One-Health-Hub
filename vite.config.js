import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return defineConfig({
    plugins: [react()],
    define: {
      // This makes the environment variable available in the browser
      // Vercel and Vite require the VITE_ prefix for client-side env vars
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    }
  })
}