import { expect, test } from "@playwright/test";
import { openSection } from "./helpers";

test.describe("Форма — профиль", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Профиль");
  });

  test("показывает текущие параметры и норму калорий", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Твои параметры" })).toBeVisible();
    await expect(page.locator(".profile-hero")).toContainText("кг ·");
    await expect(page.locator(".profile-target")).toContainText("ккал");
  });

  test("редактирует профиль через онбординг", async ({ page }) => {
    await page.getByRole("button", { name: "Редактировать" }).click();
    const modal = page.locator(".onboarding-modal");
    await modal.getByLabel("Вес, кг").fill("82");
    await modal.getByRole("button", { name: "Сохранить профиль" }).click();

    await expect(page.locator(".profile-hero")).toContainText("82 кг");
  });

  test("сохраняет шаги", async ({ page }) => {
    await page.getByLabel("Шаги сегодня").fill("12345");
    await page.getByRole("button", { name: "Сохранить шаги" }).click();

    await page.getByRole("link", { name: "Форма" }).first().click();
    // Разделитель тысяч в ru-RU зависит от ICU: точка, пробел или узкий пробел.
    await expect(page.locator(".summary-card", { hasText: "Шаги" })).toContainText(/12[\s.\u00A0\u202F]?345/);
  });

  test("добавляет замер веса", async ({ page }) => {
    const weightCard = page.locator("section", { has: page.getByRole("heading", { name: "История замеров" }) });
    await weightCard.getByLabel("Вес, кг").fill("79.4");
    await weightCard.getByRole("button", { name: "Добавить замер" }).click();

    await expect(weightCard.locator(".weight-history-row").first()).toContainText("79.4 кг");
  });

  test("экспортирует резервную копию в JSON", async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Экспорт/ }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^forma-profile-.*\.json$/);
  });

  test("сброс данных возвращает обязательный онбординг", async ({ page }) => {
    await page.getByRole("button", { name: "Сброс" }).click();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Настроим твою норму" })).toBeVisible();
  });
});
