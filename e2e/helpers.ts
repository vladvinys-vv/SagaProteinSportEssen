import { expect, type Page } from "@playwright/test";

/** Новый профиль всегда открывает онбординг — закрываем его перед сценарием. */
export async function dismissOnboarding(page: Page) {
  const close = page.getByRole("button", { name: "Закрыть" });
  if (await close.count()) await close.first().click();
}

/** Переход в раздел через нижнюю навигацию. */
const paths = { Питание: "/nutrition", Тренировки: "/workouts", Цены: "/prices", Профиль: "/profile" } as const;

export async function openSection(page: Page, name: keyof typeof paths) {
  await dismissOnboarding(page);
  await page.getByRole("navigation", { name: "Основная навигация" }).getByRole("link", { name }).click();
  await expect(page).toHaveURL(new RegExp(`${paths[name]}$`));
}
