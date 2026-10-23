import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/**/*.test.ts',
    ],
    exclude: [
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8' as any,
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/calculations/**/*.ts'],
      exclude: ['src/lib/calculations/engine.test.ts'],
    },
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
