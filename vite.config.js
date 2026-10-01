import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Lets date-based content (deal of the week) pre-render consistently
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  build: {
    // Product images live in /public and are referenced by absolute URL,
    // so the JS bundle stays small.
    assetsInlineLimit: 2048,
  },
});
