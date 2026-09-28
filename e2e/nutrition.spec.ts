import { expect, test } from "@playwright/test";
import { openSection, seedCleanState } from "./helpers";

test.describe("Форма — питание", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Питание");
  });

  test("добавляет продукт из базы в дневник", async ({ page }) => {
    await seedCleanState(page);
    await page.goto("/nutrition");

    const searchCard = page.locator("section", { has: page.getByRole("heading", { name: "Добавить продукт" }) });
    await searchCard.getByPlaceholder("Например, курица или рис").fill("Овсянка");
    await searchCard.getByRole("button", { name: /Овсянка/ }).click();

    await searchCard.getByLabel(/Количество/).fill("150");
    await searchCard.getByRole("button", { name: "Добавить в дневник" }).click();

    await expect(page.getByRole("button", { name: "Удалить Овсянка" })).toHaveCount(1);
    // 380 ккал / 100 г × 150 г = 570 ккал
    await expect(page.locator(".nutrition-mini")).toContainText("570");
  });

  test("находит продукт по штрихкоду и сообщает о неизвестном коде", async ({ page }) => {
    const searchCard = page.locator("section", { has: page.getByRole("heading", { name: "Добавить продукт" }) });

    await searchCard.getByPlaceholder("Штрихкод").fill("100000000011");
    await searchCard.getByRole("button", { name: "Найти" }).click();
    await expect(searchCard.getByText("Найдено: Сывороточный протеин")).toBeVisible();

    await searchCard.getByPlaceholder("Штрихкод").fill("000000000000");
    await searchCard.getByRole("button", { name: "Найти" }).click();
    await expect(searchCard.getByText("Продукт с таким штрихкодом не найден")).toBeVisible();
  });

  test("учитывает алкоголь в дневных калориях", async ({ page }) => {
    const alcoholCard = page.locator("section", { has: page.getByRole("heading", { name: "Алкоголь" }) });
    await alcoholCard.getByLabel("Объём, мл").fill("330");
    await alcoholCard.getByRole("button", { name: "Добавить напиток" }).click();

    await expect(page.locator(".nutrition-mini")).toContainText("ккал");
    await expect(page.getByRole("button", { name: "Удалить Astra Pils 0,5 л" })).toBeVisible();
  });

  test("добавляет напиток пресетом в один тап", async ({ page }) => {
    const alcoholCard = page.locator("section", { has: page.getByRole("heading", { name: "Алкоголь" }) });
    await alcoholCard.getByRole("button", { name: /Радлер 0,5 л/ }).click();

    // 0,5 л радлера (2,5 %) ≈ 70 ккал этанола: запись появляется в дневнике
    await expect(page.getByRole("button", { name: "Удалить Радлер 0,5 л" })).toBeVisible();
    await expect(page.locator(".nutrition-mini")).toContainText("70 ккал");
  });

  test("сохраняет пресет из дневника", async ({ page }) => {
    const searchCard = page.locator("section", { has: page.getByRole("heading", { name: "Добавить продукт" }) });
    await searchCard.getByPlaceholder("Например, курица или рис").fill("Творог");
    await searchCard.getByRole("button", { name: /Творог/ }).click();
    await searchCard.getByRole("button", { name: "Добавить в дневник" }).click();

    const presetCard = page.locator("section", { has: page.getByRole("heading", { name: "Пресеты" }) });
    await presetCard.getByLabel(/Название нового пресета/).fill("Мой завтрак");
    await presetCard.getByRole("button", { name: "Сохранить текущий приём" }).click();

    await expect(presetCard.getByText("Мой завтрак")).toBeVisible();
  });

  test("переключает день вперёд и назад", async ({ page }) => {
    const switcher = page.locator(".date-switcher");
    const today = await switcher.locator("input[type=date]").inputValue();

    await switcher.getByRole("button", { name: "Предыдущий день" }).click();
    await expect(switcher.locator("input[type=date]")).not.toHaveValue(today);

    await switcher.getByRole("button", { name: "Следующий день" }).click();
    await expect(switcher.locator("input[type=date]")).toHaveValue(today);
  });
});
