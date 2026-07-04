import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@app': path.resolve(__dirname, 'app'),
      '@shared': path.resolve(__dirname, 'app/shared'),
      '@backend': path.resolve(__dirname, 'app/backend'),
      '@renderer': path.resolve(__dirname, 'app/renderer'),
      '@components': path.resolve(__dirname, 'app/renderer/components'),
      '@hooks': path.resolve(__dirname, 'app/renderer/hooks'),
      '@views': path.resolve(__dirname, 'app/renderer/views'),
      '@services': path.resolve(__dirname, 'app/renderer/services'),
      '@contexts': path.resolve(__dirname, 'app/renderer/contexts'),
      '@utils': path.resolve(__dirname, 'app/renderer/utils'),
      '@styles': path.resolve(__dirname, 'app/renderer/styles'),
      '@assets': path.resolve(__dirname, 'assets'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/tests/setupTests.ts'],
    include: ['app/tests/**/*.test.{ts,tsx}'],
  },
});
