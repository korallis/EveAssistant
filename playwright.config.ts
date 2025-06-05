import { defineConfig } from '@playwright/test';
import { resolve } from 'path';

const outDir = resolve(__dirname, 'out', 'make');

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'electron',
      testMatch: /.*\.e2e-spec\.ts$/,
    },
  ],
}); 