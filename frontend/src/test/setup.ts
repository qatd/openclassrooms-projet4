// Runs before every test file (see `test.setupFiles` in vite.config.ts)
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest globals are off, so React Testing Library can't register its automatic cleanup:
// unmount what each test rendered so the next test starts from an empty DOM
afterEach(() => {
  cleanup();
});
