import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { quasar } from '@quasar/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    vue() as any,
    quasar({
      sassVariables: 'src/css/quasar.variables.scss',
    }) as any,
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/types/**',
        'src/boot/**',
        'src/env.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      src: path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
