import { defineConfig } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  expect: {
    timeout: 5_000,
  },
  timeout: 5_000,
  testDir: './tests',
  globalSetup: './tests/wipe-polaris-config',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5050',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    defaultBrowserType: 'firefox',
    testIdAttribute: 'data-pw',
  },

  projects: [
    // Perform initial setup
    {
      name: 'initial-setup',
      testMatch: '**/initial-setup.ts',
    },
    // Perform tests with side-effects (eg. add/remove collection directories)
    {
      name: 'admin',
      testMatch: '**/admin.ts',
      dependencies: ['initial-setup'],
      use: {
        storageState: 'playwright/.auth/user.json',
      }
    },
    // Perform all other tests
    {
      name: 'user',
      dependencies: ['admin'],
      fullyParallel: true,
      use: {
        storageState: 'playwright/.auth/user.json',
      }
    },
  ]
});
