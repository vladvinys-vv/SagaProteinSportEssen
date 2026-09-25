import { defineConfig, devices } from "@playwright/test";

const PORT = 3101;
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Отдельная конфигурация для проверок доступности (axe-core).
 * Запуск: npm run test:a11y
 */
export default defineConfig({
  testDir: "e2e/a11y",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never", outputFolder: "playwright-report/a11y" }]] : "list",
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    locale: "ru-RU",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx vite --port ${PORT} --strictPort`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
