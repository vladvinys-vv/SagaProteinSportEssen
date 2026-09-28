import { beforeEach, describe, expect, it } from "vitest";
import { createDemoState, createEmptyState } from "@/data/demo";
import { importState, loadState, STORAGE_KEY, saveState } from "@/lib/storage";
import type { PriceEntry } from "@/types";

/** Полный набор цен старого демо: московские сети и рубли. */
const legacyDemoPrices = (): PriceEntry[] => {
  const rows: Array<[string, string, string, number, number]> = [
    ["chicken", "Куриная грудка", "Дикси", 449, 1000],
    ["chicken", "Куриная грудка", "Пятёрочка", 399, 1000],
    ["chicken", "Куриная грудка", "Лента", 379, 1000],
    ["chicken", "Куриная грудка", "Азбука вкуса", 899, 1000],
    ["rice", "Рис отварной", "Дикси", 119, 900],
    ["rice", "Рис отварной", "Пятёрочка", 139, 900],
    ["rice", "Рис отварной", "Азбука вкуса", 289, 900],
    ["salmon", "Лосось", "Пятёрочка", 1090, 1000],
    ["salmon", "Лосось", "Рыбный ряд", 1290, 1000],
    ["salmon", "Лосось", "Азбука вкуса", 1890, 1000],
    ["oats", "Овсянка", "Пятёрочка", 149, 800],
    ["oats", "Овсянка", "Дикси", 129, 800],
    ["oats", "Овсянка", "Лента", 159, 800],
    ["oats", "Овсянка", "Азбука вкуса", 299, 800],
    ["whey", "Сывороточный протеин", "Спортпит маркет", 2990, 900],
    ["whey", "Сывороточный протеин", "Озон", 2590, 900],
    ["whey", "Сывороточный протеин", "Азбука вкуса", 3490, 900],
  ];
  return rows.map(([foodId, productName, store, packagePrice, packageSizeG], index) => ({
    id: `price-${foodId}-${index}`,
    productId: foodId,
    productName,
    store,
    city: "Москва",
    currency: "RUB",
    packagePrice,
    packageSizeG,
    date: "2025-01-01",
  }));
};

describe("локальное хранилище", () => {
  beforeEach(() => window.localStorage.clear());

  it("без сохранённых данных отдаёт демо-состояние", () => {
    const state = loadState();
    expect(state.version).toBe(1);
    expect(state.meals.length).toBeGreaterThan(0);
    expect(state.profile.weightKg).toBe(createDemoState().profile.weightKg);
  });

  it("сохраняет и читает состояние", () => {
    const base = createEmptyState();
    saveState({ ...base, profile: { ...base.profile, steps: 12345 } });
    expect(loadState().profile.steps).toBe(12345);
  });

  it("игнорирует повреждённый JSON и чужую версию схемы", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ это не json");
    expect(loadState().meals.length).toBeGreaterThan(0);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, profile: {}, meals: [] }));
    expect(loadState().profile.weightKg).toBe(createDemoState().profile.weightKg);
  });

  it("переносит нетронутое московское демо на цены Гамбурга", () => {
    const legacy = createEmptyState();
    legacy.prices = legacyDemoPrices();
    legacy.profile = { ...legacy.profile, currency: "RUB" };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const state = loadState();
    expect(new Set(state.prices.map((entry) => entry.city))).toEqual(new Set(["Гамбург"]));
    expect(new Set(state.prices.map((entry) => entry.currency))).toEqual(new Set(["EUR"]));
    expect(state.prices.some((entry) => entry.store === "Aldi Nord")).toBe(true);
    expect(state.profile.currency).toBe("EUR");
  });

  it("не трогает цены, которые человек ввёл сам", () => {
    const custom = createEmptyState();
    custom.prices = [
      { id: "mine", productId: "chicken", productName: "Куриная грудка", store: "Rewe", city: "Москва", currency: "RUB", packagePrice: 4.29, packageSizeG: 500, date: "2025-01-01" },
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));

    const state = loadState();
    expect(state.prices).toHaveLength(1);
    expect(state.prices[0]!.store).toBe("Rewe");
  });

  it("импорт старой копии тоже переезжает на немецкий рынок", () => {
    const legacy = createEmptyState();
    legacy.prices = legacyDemoPrices();
    const imported = importState(JSON.stringify({ state: legacy }));
    expect(imported.prices[0]!.store).toBe("Aldi Nord");
    expect(imported.prices[0]!.currency).toBe("EUR");
  });

  it("импортирует резервную копию и отклоняет мусор", () => {
    const base = createEmptyState();
    const imported = importState(JSON.stringify({ state: base }));
    expect(imported.profile.heightCm).toBe(base.profile.heightCm);
    expect(imported.meals).toEqual([]);

    expect(() => importState(JSON.stringify({ state: { version: 1 } }))).toThrow();
    expect(() => importState("null")).toThrow();
  });
});
