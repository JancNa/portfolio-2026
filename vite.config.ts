import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const supabaseOrigin = env.VITE_SUPABASE_URL?.replace(/\/$/, '') ?? '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Proxy: el navegador llama a mismo origen (localhost) y Vite reenvía a Supabase.
      // Evita "Failed to fetch" frecuente en local por CORS, extensiones o políticas de red.
      proxy: supabaseOrigin
        ? {
            '/__supabase-functions': {
              target: supabaseOrigin,
              changeOrigin: true,
              secure: true,
              rewrite: (p) => p.replace(/^\/__supabase-functions/, '/functions/v1'),
            },
          }
        : undefined,
    },
  };
});
