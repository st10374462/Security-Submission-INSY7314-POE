import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Vite will pick up environment variables from .env (prefix with VITE_)
const useHttps = process.env.VITE_HTTPS === 'true';
let httpsConfig = false;
if (useHttps) {
  const keyPath = process.env.VITE_SSL_KEY || path.resolve('./localhost-key.pem');
  const certPath = process.env.VITE_SSL_CERT || path.resolve('./localhost.pem');
  try {
    httpsConfig = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    console.log('Vite: HTTPS enabled using', keyPath, certPath);
  } catch (err) {
    console.warn('Vite: Could not load SSL key/cert for HTTPS:', err.message);
    httpsConfig = false;
  }
}

const backendDefault = useHttps ? 'https://localhost:5001' : 'http://localhost:5000';
const backendUrl = process.env.VITE_BACKEND_URL || backendDefault;

export default defineConfig({
  plugins: [react()],
  server: {
    https: httpsConfig,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
})