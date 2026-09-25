import { expect, type Page } from "@playwright/test";

/** Новый профиль всегда открывает онбординг — закрываем его перед сценарием. */
export async function dismissOnboarding(page: Page) {
  const close = page.getByRole("button", { name: "Закрыть" });
  if (await close.count()) await close.first().click();
}

/** Переход в раздел через нижнюю навигацию. */
export async function openSection(page: Page, name: "Питание" | "Тренировки" | "Профиль") {
  await dismissOnboarding(page);
  await page.getByRole("navigation", { name: "Основная навигация" }).getByRole("link", { name }).click();
  await expect(page).toHaveURL(new RegExp(`/${name === "Питание" ? "nutrition" : name === "Тренировки" ? "workouts" : "profile"}$`));
}
