import { createDemoState, createHamburgPrices } from "@/data/demo";
import type { AppState } from "@/types";

export const STORAGE_KEY = "forma-state-v1";

const isAppState = (value: unknown): value is AppState => {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<AppState>;
  return typeof state.version === "number" && Boolean(state.profile) && Array.isArray(state.meals) && Array.isArray(state.weights) && Array.isArray(state.programs);
};

/** Магазины, которые были только в старом московском демо. */
const LEGACY_DEMO_STORES = new Set(["Дикси", "Пятёрочка", "Лента", "Азбука вкуса", "Рыбный ряд", "Спортпит маркет", "Озон"]);

/**
 * Старые сохранения хранят демо-цены московских сетей в рублях. Переносим их
 * на немецкий рынок только если это ровно то самое нетронутое демо: набор
 * магазинов совпадает и все записи в рублях. Как только человек добавил своё
 * наблюдение, ничего не трогаем.
 */
export const migrateDemoPrices = (state: AppState): AppState => {
  const untouchedDemo = state.prices.length >= 10
    && state.prices.every((entry) =>
      entry.city === "Москва" && entry.currency === "RUB" && LEGACY_DEMO_STORES.has(entry.store));
  if (!untouchedDemo) return state;
  return {
    ...state,
    prices: createHamburgPrices(),
    profile: state.profile.currency === "RUB" ? { ...state.profile, currency: "EUR" } : state.profile,
  };
};

const readState = (raw: string): AppState => {
  const parsed = JSON.parse(raw) as unknown;
  if (!isAppState(parsed) || parsed.version !== 1) return createDemoState();
  return migrateDemoPrices(parsed);
};

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? readState(raw) : createDemoState();
  } catch {
    return createDemoState();
  }
};

export const saveState = (state: AppState): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* local storage unavailable */ }
};

export const importState = (raw: string): AppState => {
  let parsed: { state?: unknown };
  try {
    parsed = JSON.parse(raw) as { state?: unknown };
  } catch {
    throw new Error("Не удалось прочитать файл данных: это не корректный JSON");
  }
  if (!isAppState(parsed?.state)) throw new Error("Не удалось прочитать файл данных: неизвестный формат резервной копии");
  return migrateDemoPrices(parsed.state);
};
