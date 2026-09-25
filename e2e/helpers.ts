import { expect, type Locator, type Page } from "@playwright/test";
import { createEmptyState } from "@/data/demo";
import type { AppState } from "@/types";

/**
 * Пустое состояние без онбординга: сценарии считают от нуля, а не от демо.
 * Вызывать до перехода на страницу — состояние подкладывается при загрузке.
 */
export async function seedCleanState(page: Page, patch: Partial<AppState> = {}) {
  const base = createEmptyState();
  const state: AppState = { ...base, ...patch, profile: { ...base.profile, completed: true, ...patch.profile } };
  await page.addInitScript((value) => window.localStorage.setItem("forma-state-v1", value), JSON.stringify(state));
}

/** Новый профиль всегда открывает онбординг — закрываем его перед сценарием. */
export async function dismissOnboarding(page: Page) {
  const close = page.getByRole("button", { name: "Закрыть" });
  if (await close.count()) await close.first().click();
}

/**
 * Тап по элементу вручную: прокручиваем и нажимаем по центру.
 *
 * На мобильной эмуляции встроенная проверка Playwright «элемент не перекрыт»
 * ругается на фиксированную нижнюю панель и круглую кнопку быстрых действий:
 * элемент у нижнего края страницы так и не признаётся кликабельным, хотя живой
 * тап попадает точно в кнопку. Проверяем именно живой тап, как палец.
 */
export async function tapElement(page: Page, locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("Элемент не виден для тапа");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

/** Переход в раздел через нижнюю навигацию. */
const paths = { Питание: "/nutrition", Тренировки: "/workouts", Цены: "/prices", Профиль: "/profile" } as const;

export async function openSection(page: Page, name: keyof typeof paths) {
  await dismissOnboarding(page);
  await page.getByRole("navigation", { name: "Основная навигация" }).getByRole("link", { name }).click();
  await expect(page).toHaveURL(new RegExp(`${paths[name]}$`));
}
