import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60000, // Global timeout for each test
  expect: {
    timeout: 10000, // Timeout for expect assertions
  },
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000, // Timeout for actions like click, fill, etc.
    navigationTimeout: 30000, // Timeout for page navigation
    trace: 'on-first-retry',
  },
  reporter: 'html',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});