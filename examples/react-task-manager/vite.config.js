import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    // The browser calls Vite; Vite forwards /api to your Windows REST server.
    proxy: { '/api': 'http://127.0.0.1:3001' }
  }
});
