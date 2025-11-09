import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/presentation/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    conditions: ['import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    include: ['@repo/types'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
})
