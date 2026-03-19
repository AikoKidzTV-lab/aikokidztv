import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = String(env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');

  return {
    base: '/',
    plugins: [react()],
    server: {
      port: 5176,
      strictPort: false,
      proxy: supabaseUrl
        ? {
            '/functions/v1': {
              target: supabaseUrl,
              changeOrigin: true,
              secure: true,
            },
          }
        : undefined,
    },
  };
});
