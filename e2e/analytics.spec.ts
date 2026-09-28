import { expect, test } from "@playwright/test";
import { dismissOnboarding } from "./helpers";

test.describe("Форма — аналитика", () => {
  test.beforeEach(async ({ page }) => {
    // Демо-профиль не завершён, поэтому окно онбординга появляется после каждой
    // полной загрузки — закрываем его уже на самой странице аналитики.
    await page.goto("/analytics");
    await dismissOnboarding(page);
  });

  test("показывает сводку периода и график веса", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Что говорят данные" })).toBeVisible();
    await expect(page.locator(".analytics-overview")).toContainText("Средний вес");
    await expect(page.locator("svg.trend-chart")).toHaveCount(1);
  });

  test("переключает метрику и период", async ({ page }) => {
    await page.getByRole("button", { name: "Калории", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Калории", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "30 дней" }).click();
    await expect(page.locator(".title-stat")).toContainText("30 дней");
  });

  test("сохраняет ручную правку активности профиля", async ({ page }) => {
    const activityCard = page.locator("section", { has: page.getByRole("heading", { name: "Ручной ввод" }) });
    const trainingHours = activityCard.getByLabel("Тренировка");
    await trainingHours.fill("2");
    await expect(activityCard.locator(".activity-total b")).toHaveText("25.0 ч");
    await expect(activityCard.locator(".activity-total b")).toHaveClass(/is-invalid/);
  });

  test("показывает пустую историю коррекций нормы", async ({ page }) => {
    const historyCard = page.locator("section", { has: page.getByRole("heading", { name: "Коррекции нормы" }) });
    await expect(historyCard.getByText("Коррекций пока не было")).toBeVisible();
  });
});
