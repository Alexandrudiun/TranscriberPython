import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/transcribe': 'http://localhost:5000',
      '/download_srt': 'http://localhost:5000',
    },
  },
});
