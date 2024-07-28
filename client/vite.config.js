import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {Buffer} from 'buffer'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port: 3000,
    proxy: {
			"/api": {
				target: "http://localhost:2000",
				changeOrigin: true,
				secure: false,
			},
		},
		
  }
})
