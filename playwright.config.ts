import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// Loopback only: the server is for the tests, not the local network.
const ORIGIN = `http://127.0.0.1:${PORT}`;

/**
 * Browser smoke tests against the production build: `npm run build` first,
 * then `npm run test:e2e` starts `next start` on its own port.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: ORIGIN,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `npm run start -- -p ${PORT} -H 127.0.0.1`,
    url: ORIGIN,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
