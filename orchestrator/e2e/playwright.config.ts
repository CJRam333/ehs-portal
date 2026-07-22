import { defineConfig, devices } from '@playwright/test';

// E2E config for the EHS Portal. Assumes the frontend dev server is started
// separately by the phase test script (which also starts the backend), and
// that the frontend proxies /api to the backend on :8080.
// BASE_URL can be overridden; defaults to the Vite dev server.
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,      // flows share a backend + DB; keep them serial
  workers: 1,
  // The first spec to exercise the API hits a cold backend (Hibernate first-query
  // warmup) + cold Vite dev compile of the /details chunk, which can exceed the
  // 10s expect timeout. One retry lets that single environmental flake self-heal
  // once the server is warm; a real regression still fails on every attempt.
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
