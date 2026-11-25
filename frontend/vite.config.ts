/// <reference types="vitest/config" />
// The reference above only adds the types of the `test` block: Vitest is not loaded by `vite build`
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    // Simulated browser (DOM, localStorage...) so React components can render in Node
    environment: 'jsdom',
    // Lets React Testing Library register its automatic cleanup: each test starts from an empty DOM
    globals: true,
    // Node 25+ has its own localStorage, which hides the jsdom one and fails without a storage file: turn it off
    execArgv: ['--no-experimental-webstorage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Listing the sources makes untested files show up at 0% instead of being ignored
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/main.tsx', // bootstrap only: mounts <App /> into index.html
        'src/types/**', // type definitions only, no runtime code
        'src/vite-env.d.ts',
      ],
      // `npm run test:coverage` fails if any indicator drops below 80%
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
