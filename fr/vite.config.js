import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/transcribe': 'http://192.168.100.8:5000',
      '/download_srt': 'http://192.168.100.8:5000',
    },
  },
});
