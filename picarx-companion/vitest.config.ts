import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/baseline/**/*.test.ts', 'tests/publication/**/*.test.ts', 'tests/session/**/*.test.ts'], testTimeout: 30000 } });
