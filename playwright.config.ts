import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0, // never mask flakiness: a failure stays a failure
  // The page is animation-heavy; a couple of workers keeps CPU contention (and
  // trace/screenshot capture) from slowing tests down.
  workers: 2,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on',
    screenshot: 'on',
    video: 'off',
  },
  // Every check runs on desktop and on a mobile (touch, 412px-wide) viewport.
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-pixel7', use: { ...devices['Pixel 7'] } },
  ],
  // Tests run against a real production build (with test hooks enabled), so the
  // CSP proxy, fonts and minified bundles are all exercised.
  webServer: {
    command: 'npm run build:e2e && npm run start:e2e',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 240_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
