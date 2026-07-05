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
      '@backend/ai/ai-engine': path.resolve(__dirname, 'app/tests/mocks/ai-engine.ts'),
      '@backend/ai/classifier': path.resolve(__dirname, 'app/tests/mocks/ai-classifier.ts'),
      '@backend/ai/enhancer': path.resolve(__dirname, 'app/tests/mocks/ai-enhancer.ts'),
      '@backend/ai/summarizer': path.resolve(__dirname, 'app/tests/mocks/ai-summarizer.ts'),
      '@backend/clipboard/watcher': path.resolve(__dirname, 'app/tests/mocks/clipboard-watcher.ts'),
      '@backend/clipboard/history-store': path.resolve(__dirname, 'app/tests/mocks/clipboard-history-store.ts'),
      '@backend/clipboard/normalizer': path.resolve(__dirname, 'app/tests/mocks/clipboard-normalizer.ts'),
      '@backend/clipboard/formatter': path.resolve(__dirname, 'app/tests/mocks/clipboard-formatter.ts'),
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
      electron: path.resolve(__dirname, 'app/tests/mocks/electron.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/tests/setupTests.ts'],
    include: ['app/tests/**/*.test.{ts,tsx}'],
  },
});
