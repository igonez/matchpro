import { defineConfig } from '@playwright/test';
import { loadEnvLocal } from './tests/e2e/helpers/supabase-seed';

loadEnvLocal();

const baseURL = 'http://127.0.0.1:3005';
const channel = process.env.PLAYWRIGHT_CHANNEL || 'chrome';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  use: {
    baseURL,
    channel,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  webServer: {
    command: process.env.PLAYWRIGHT_SERVER_CMD || 'npm run dev -- --port 3005',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'public-desktop',
      testMatch: /public-screens\.spec\.ts/,
      use: {
        viewport: { width: 1440, height: 900 },
        hasTouch: false,
      },
    },
    {
      name: 'public-mobile',
      testMatch: /public-screens\.spec\.ts/,
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
      },
    },
    {
      name: 'student-mobile',
      testMatch: /(student-screens|mission-share)\.spec\.ts/,
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        storageState: 'tests/e2e/.auth/student.json',
      },
    },
    {
      name: 'student-mobile-se',
      testMatch: /student-screens\.spec\.ts/,
      use: {
        viewport: { width: 375, height: 667 },
        hasTouch: true,
        storageState: 'tests/e2e/.auth/student.json',
      },
    },
    {
      name: 'coach-desktop',
      testMatch: /coach-screens-and-flows\.spec\.ts/,
      use: {
        viewport: { width: 1440, height: 900 },
        hasTouch: false,
        storageState: 'tests/e2e/.auth/coach.json',
      },
    },
    {
      name: 'coach-mobile',
      testMatch: /coach-screens-and-flows\.spec\.ts/,
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        storageState: 'tests/e2e/.auth/coach.json',
      },
    },
  ],
});
