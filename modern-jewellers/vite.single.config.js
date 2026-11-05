// Builds the whole site into ONE self-contained index.html (dist-single/index.html).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  define: { 'import.meta.env.VITE_SINGLE': JSON.stringify('1') },
  publicDir: false,
  build: { outDir: 'dist-single', assetsInlineLimit: 100000000, cssCodeSplit: false },
});
