import { expect, test } from "@playwright/test";
import { openSection } from "./helpers";

test.describe("Форма — тренировки", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Тренировки");
  });

  test("показывает программы и следующий рабочий вес", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Выбери план" })).toBeVisible();
    await expect(page.locator(".program-card")).toHaveCount(4);
    await expect(page.locator(".next-weight").first()).toContainText("следующий вес");
  });

  test("переключает программу и день", async ({ page }) => {
    const cards = page.locator(".program-card");
    await cards.nth(1).click();
    await expect(cards.nth(1)).toHaveClass(/is-selected/);

    const dayTabs = page.locator(".day-tabs button");
    await expect(dayTabs).toHaveCount(2);
    await dayTabs.nth(1).click();
    await expect(dayTabs.nth(1)).toHaveClass(/is-active/);
  });

  test("записывает тренировку в журнал", async ({ page }) => {
    const journal = page.locator("section", { has: page.getByRole("heading", { name: "Записать тренировку" }) });
    const pendingSets = journal.locator(".pending-sets");
    await expect(pendingSets.first()).toBeVisible();
    await pendingSets.first().getByPlaceholder("Кг").fill("80");
    await pendingSets.first().getByPlaceholder("Повторы").fill("8");
    await journal.getByRole("button", { name: "Сохранить тренировку" }).click();

    await expect(page.locator(".workout-history .history-row").first()).toContainText("80×8");
  });

  test("добавляет упражнение в выбранный день", async ({ page }) => {
    const dayCard = page.locator("section", { has: page.locator(".exercise-list") });
    const initialCount = await dayCard.locator(".exercise-row").count();

    await dayCard.getByPlaceholder("Например, тяга блока").fill("Тяга блока");
    await dayCard.getByRole("button", { name: "Добавить", exact: true }).click();

    await expect(dayCard.locator(".exercise-row")).toHaveCount(initialCount + 1);
    await expect(dayCard.getByText("Тяга блока").first()).toBeVisible();
  });

  test("собирает пользовательскую программу", async ({ page }) => {
    const builder = page.locator("section", { has: page.getByRole("heading", { name: "Пользовательская программа" }) });
    await builder.getByLabel("Название программы").fill("Три дня в неделю");
    await builder.locator(".constructor-form").getByPlaceholder("Например, тяга блока").fill("Присед");
    await builder.getByRole("button", { name: "Добавить упражнение" }).click();
    await builder.getByRole("button", { name: "Сохранить программу" }).click();

    await expect(page.locator(".program-card", { hasText: "Три дня в неделю" })).toHaveCount(1);
  });
});
