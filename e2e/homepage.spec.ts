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
});
