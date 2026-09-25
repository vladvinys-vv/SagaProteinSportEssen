import { expect, test } from "@playwright/test";
import { dismissOnboarding, openSection } from "./helpers";

test.describe("Форма — оболочка приложения", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("открывает локальную панель", async ({ page }) => {
    await expect(page).toHaveTitle(/Форма/);
    await expect(page.getByRole("heading", { name: "Держи ритм" })).toBeVisible();
  });

  test("показывает обязательный онбординг профиля", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Настроим твою норму" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Сохранить профиль" })).toBeEnabled();
  });

  test("сохраняет профиль из онбординга и закрывает модальное окно", async ({ page }) => {
    await page.getByRole("button", { name: "Сохранить профиль" }).click();
    await expect(page.getByRole("heading", { name: "Настроим твою норму" })).toBeHidden();

    await page.reload();
    await expect(page.getByRole("heading", { name: "Держи ритм" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Настроим твою норму" })).toBeHidden();
  });

  test("переключает основные разделы", async ({ page }) => {
    await openSection(page, "Питание");
    await expect(page.getByRole("heading", { name: "Каждый приём на виду" })).toBeVisible();

    await page.getByRole("navigation", { name: "Основная навигация" }).getByRole("link", { name: "Тренировки" }).click();
    await expect(page.getByRole("heading", { name: "Сила в системе" })).toBeVisible();
  });

  test("использует нижнюю навигацию Питание, Тренировки, Профиль", async ({ page }) => {
    await dismissOnboarding(page);
    const navigation = page.getByRole("navigation", { name: "Основная навигация" });
    await expect(navigation.getByRole("link", { name: "Питание" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Тренировки" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Цены" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Профиль" })).toBeVisible();

    await navigation.getByRole("link", { name: "Профиль" }).click();
    await expect(page.getByRole("heading", { name: "Твои параметры" })).toBeVisible();
  });

  test("ведёт в раздел цен и показывает сравнение магазинов", async ({ page }) => {
    await openSection(page, "Цены");
    await expect(page.getByRole("heading", { name: "Где дешевле, а где изысканнее" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Магазины по кошельку" })).toBeVisible();
  });

  test("открывает быстрые действия и уводит к нужной форме", async ({ page }) => {
    await dismissOnboarding(page);
    await page.getByRole("button", { name: "Быстрые действия" }).click();
    const sheet = page.getByRole("dialog", { name: "Быстрые действия" });
    await expect(sheet).toBeVisible();

    await sheet.getByRole("button", { name: /Внести алкоголь/ }).click();
    await expect(page).toHaveURL(/\/nutrition$/);
    await expect(sheet).toBeHidden();
    // Карточка алкоголя в фокусе: первое поле формы готово к вводу.
    await expect(page.locator("#alcohol input").first()).toBeFocused();
  });

  test("ведёт по ссылкам аналитики и возвращает на главную", async ({ page }) => {
    await dismissOnboarding(page);
    await page.getByRole("link", { name: /Все данные/ }).click();
    await expect(page.getByRole("heading", { name: "Что говорят данные" })).toBeVisible();

    await page.getByRole("link", { name: "Форма" }).first().click();
    await expect(page.getByRole("heading", { name: "Держи ритм" })).toBeVisible();
  });

  test("показывает страницу 404 для неизвестного маршрута", async ({ page }) => {
    await dismissOnboarding(page);
    await page.goto("/nope");
    await expect(page.getByText("Страница не найдена")).toBeVisible();
  });

  test("регистрирует PWA manifest и service worker", async ({ page }) => {
    const manifest = await page.evaluate(async () => {
      const response = await fetch("/manifest.webmanifest");
      return { ok: response.ok, data: await response.json() };
    });
    expect(manifest.ok).toBe(true);
    expect(manifest.data.display).toBe("standalone");
    expect(manifest.data.start_url).toBe("/");
    expect(manifest.data.icons.some((icon: { sizes: string }) => icon.sizes === "512x512")).toBe(true);

    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  });

  test("открывается offline после первичной загрузки", async ({ page, context }) => {
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
    await page.reload({ waitUntil: "load" });
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
    await dismissOnboarding(page);
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await context.close();
  });
});
