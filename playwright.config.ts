import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  reporter: [['list'], ['html']],
  use: {
    browserName: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    baseURL: 'https://example.com',
    locale: 'en-US',
    geolocation: { latitude: 10.75, longitude: 106.66 },
    timezoneId: 'Europe/London',
    permissions: ['geolocation'],
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    // { name: 'firefox', use: { browserName: 'firefox' } },
    // { name: 'webkit', use: { browserName: 'webkit' } },
    // {
	  //   name: 'iPhone 13',
	  //   use: {
		// 		      ...devices['iPhone 13'],  // Test iPhone 13
		// 		      headless: false,          // Bật/tắt headless
		// 		  }
	  // }
  ],
  workers: 1,
});