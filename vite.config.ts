import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // Tạo object define từ tất cả các biến môi trường
  const envDefine = Object.entries(env).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[`import.meta.env.${key}`] = JSON.stringify(value)
    return acc
  }, {})

  return {
    plugins: [react()],
    define: {
      ...envDefine,
      global: 'window', // 👈 Fix sockjs-client require 'global'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // Proxy Vietmap tiles to avoid CORS issues in development
        '/vietmap-tiles': {
          target: 'https://maps.vietmap.vn',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/vietmap-tiles/, '/maps/tiles'),
          secure: false,
        }
      }
    }
  }
})
