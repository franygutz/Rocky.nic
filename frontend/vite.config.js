import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Un solo index.html que abre sin internet. El motor se importa desde ../backend (fuente única).
export default defineConfig({
  base: process.env.VITE_BASE || './',
  plugins: [viteSingleFile()],
  server: { fs: { allow: ['..'] } },
  build: { chunkSizeWarningLimit: 4000 },
  test: { environment: 'node', include: ['tests/**/*.test.js'] }
});
