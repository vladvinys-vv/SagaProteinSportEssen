import { test, expect } from "@playwright/test";

test.describe("Форма", () => {
  test("открывает локальную панель", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Форма/);
    await expect(page.getByRole("heading", { name: "Держи ритм" })).toBeVisible();
  });

  test("показывает онбординг профиля", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Настроим твою норму" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Сохранить профиль" })).toBeEnabled();
  });

  test("переключает основные разделы", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Закрыть" }).click();
    await page.getByRole("navigation", { name: "Основная навигация" }).getByRole("link", { name: "Питание" }).click();
    await expect(page).toHaveURL(/\/nutrition$/);
    await expect(page.getByRole("heading", { name: "Каждый приём на виду" })).toBeVisible();
  });

  test("использует нижнюю навигацию Питание, Тренировки, Профиль", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Закрыть" }).click();
    const navigation = page.getByRole("navigation", { name: "Основная навигация" });
    await expect(navigation.getByRole("link", { name: "Питание" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Тренировки" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Профиль" })).toBeVisible();
    await navigation.getByRole("link", { name: "Профиль" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "Твои параметры" })).toBeVisible();
  });

  test("регистрирует PWA manifest и service worker", async ({ page }) => {
    await page.goto("/");
    const manifest = await page.evaluate(async () => {
      const response = await fetch("/manifest.webmanifest");
      return { ok: response.ok, data: await response.json() };
    });
    expect(manifest.ok).toBe(true);
    expect(manifest.data.display).toBe("standalone");
    expect(manifest.data.start_url).toBe("/");
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  });

  test("открывается offline после первичной загрузки", async ({ page, context }) => {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Держи ритм" })).toBeVisible();
    await context.setOffline(false);
  });

  test("не имеет горизонтального overflow на мобильном viewport", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto("/");
    const closeButton = page.getByRole("button", { name: "Закрыть" });
    if (await closeButton.count()) await closeButton.click();
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await context.close();
  });
});
