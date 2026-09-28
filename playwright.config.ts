import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Путь к своему Chromium: удобно там, где скачивание браузеров Playwright
 * недоступно (офлайн-сборка, системный пакет, контейнер без CDN).
 */
const CHROMIUM_PATH = process.env.E2E_CHROMIUM_PATH;
const chromiumLaunch: { executablePath: string; args: string[] } | undefined = CHROMIUM_PATH
  ? { executablePath: CHROMIUM_PATH, args: ["--no-sandbox", "--disable-dev-shm-usage"] }
  : undefined;

export default defineConfig({
  testDir: "e2e",
  // Проверки доступности живут в отдельном конфиге: npm run test:a11y
  testIgnore: "a11y/**",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: BASE_URL,
    locale: "ru-RU",
    timezoneId: "Europe/Berlin",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    launchOptions: chromiumLaunch,
  },
  // При подмене бинарника доступен только Chromium: firefox не запустится,
  // а мобильный проект тоже chromium-based и работает.
  projects: CHROMIUM_PATH
    ? [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "mobile", use: { ...devices["Pixel 7"] } },
      ]
    : [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        { name: "mobile", use: { ...devices["Pixel 7"] } },
      ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
