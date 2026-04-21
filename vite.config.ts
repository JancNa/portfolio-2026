import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const supabaseOrigin =
    (env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.replace(/\/$/, '') ?? '';

  return {
    base: '/',
    plugins: [
      {
        name: 'warn-missing-supabase-proxy',
        configureServer(server) {
          server.httpServer?.once('listening', () => {
            if (!supabaseOrigin) {
              console.warn(
                '\n[vite] VITE_SUPABASE_URL no está definida al arrancar Vite: el proxy /__supabase-functions no se activa. ' +
                  'Crea un .env en la raíz del proyecto (copia .env.example) o exporta VITE_SUPABASE_URL.\n'
              );
            }
          });
        },
      },
      react(),
      tailwindcss(),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: supabaseOrigin
        ? {
            '/__supabase-functions': {
              target: supabaseOrigin,
              changeOrigin: true,
              secure: true,
              rewrite: (p) => p.replace(/^\/__supabase-functions/, '/functions/v1'),
              configure: (proxy) => {
                proxy.on('error', (err, req) => {
                  console.error('[vite proxy \u2192 Supabase]', req?.url, err.message);
                });
              },
            },
          }
        : undefined,
    },
  };
});
