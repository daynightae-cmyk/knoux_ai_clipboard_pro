import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, '.'),
      '@app': path.resolve(rootDir, 'app'),
      '@shared': path.resolve(rootDir, 'app/shared'),
      '@backend/ai/ai-engine': path.resolve(rootDir, 'app/tests/mocks/ai-engine.ts'),
      '@backend/ai/classifier': path.resolve(rootDir, 'app/tests/mocks/ai-classifier.ts'),
      '@backend/ai/enhancer': path.resolve(rootDir, 'app/tests/mocks/ai-enhancer.ts'),
      '@backend/ai/summarizer': path.resolve(rootDir, 'app/tests/mocks/ai-summarizer.ts'),
      '@backend/clipboard/watcher': path.resolve(rootDir, 'app/tests/mocks/clipboard-watcher.ts'),
      '@backend/clipboard/history-store': path.resolve(rootDir, 'app/tests/mocks/clipboard-history-store.ts'),
      '@backend/clipboard/normalizer': path.resolve(rootDir, 'app/tests/mocks/clipboard-normalizer.ts'),
      '@backend/clipboard/formatter': path.resolve(rootDir, 'app/tests/mocks/clipboard-formatter.ts'),
      '@backend': path.resolve(rootDir, 'app/backend'),
      '@renderer': path.resolve(rootDir, 'app/renderer'),
      '@components': path.resolve(rootDir, 'app/renderer/components'),
      '@hooks': path.resolve(rootDir, 'app/renderer/hooks'),
      '@views': path.resolve(rootDir, 'app/renderer/views'),
      '@services': path.resolve(rootDir, 'app/renderer/services'),
      '@contexts': path.resolve(rootDir, 'app/renderer/contexts'),
      '@utils': path.resolve(rootDir, 'app/renderer/utils'),
      '@styles': path.resolve(rootDir, 'app/renderer/styles'),
      '@assets': path.resolve(rootDir, 'assets'),
      electron: path.resolve(rootDir, 'app/tests/mocks/electron.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/tests/setupTests.ts'],
    include: ['app/tests/**/*.test.{ts,tsx}'],
  },
});
