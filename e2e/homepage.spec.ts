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
});
