import { describe, expect, it } from "vitest";
import { createEmptyState } from "@/data/demo";
import {
  GOAL_CALORIE_ADJUSTMENTS,
  calculateDailyTotals,
  calculateMacroTargets,
  dateKey,
  daysAgoKey,
  getAutoCorrection,
  getPriceCategory,
} from "@/lib/calculations";
import type { AlcoholEntry, MealEntry, PriceEntry } from "@/types";

const profile = createEmptyState().profile;

describe("расчёты Forma", () => {
  it("применяет фиксированные корректировки цели", () => {
    expect(GOAL_CALORIE_ADJUSTMENTS).toEqual({ gain: 300, maintain: 0, recomp: 0, cut: -450 });
    const gain = calculateMacroTargets({ ...profile, goal: "gain" });
    const cut = calculateMacroTargets({ ...profile, goal: "cut" });
    expect(gain.calories - calculateMacroTargets({ ...profile, goal: "maintain" }).calories).toBe(300);
    expect(cut.calories - calculateMacroTargets({ ...profile, goal: "maintain" }).calories).toBe(-450);
  });

  it("включает алкоголь в дневные калории и adherence", () => {
    const today = dateKey();
    const meal: MealEntry = {
      id: "meal",
      date: today,
      meal: "breakfast",
      name: "Овсянка",
      amountG: 100,
      calories: 380,
      protein: 13,
      fat: 7,
      carbs: 62,
      sugar: 1,
      source: "database",
      junkFood: false,
    };
    const alcohol: AlcoholEntry = { id: "alcohol", date: today, name: "Вино", volumeMl: 150, abv: 12.5, calories: 90 };
    const totals = calculateDailyTotals([meal], [alcohol], today);
    expect(totals.calories).toBe(470);
    expect(totals.alcoholCalories).toBe(90);
    expect(totals.protein).toBe(13);
  });

  it("предлагает автокоррекцию только при достаточном окне данных", () => {
    const today = dateKey();
    const state = createEmptyState();
    state.profile = { ...profile, goal: "maintain", calorieAdjustment: 0 };
    state.meals = Array.from({ length: 7 }, (_, index) => {
      const date = daysAgoKey(6 - index);
      return { id: `meal-${index}`, date, meal: "breakfast" as const, name: "Продукт", amountG: 100, calories: 100, protein: 10, fat: 2, carbs: 12, sugar: 1, source: "database" as const, junkFood: false };
    });
    state.alcohol = [{ id: "alcohol", date: today, name: "Вино", volumeMl: 150, abv: 12.5, calories: 100 }];
    state.weights = Array.from({ length: 13 }, (_, index) => {
      const date = daysAgoKey(12 - index);
      return { id: `weight-${index}`, date, weightKg: index < 7 ? 70 : 70.5 };
    });
    const correction = getAutoCorrection(state, today, 7);
    expect(correction).not.toBeNull();
    expect(correction?.active).toBe(true);
    expect(correction?.suggestedAdjustment).toBe(-250);
    expect(correction?.averageCalories).toBeGreaterThan(100);
  });

  it("сравнивает категории цен внутри одного продукта", () => {
    const prices: PriceEntry[] = [
      { id: "cheap", productId: "chicken", productName: "Курица", store: "А", city: "Москва", currency: "RUB", packagePrice: 400, packageSizeG: 1000, date: dateKey() },
      { id: "premium", productId: "chicken", productName: "Курица", store: "Б", city: "Москва", currency: "RUB", packagePrice: 800, packageSizeG: 1000, date: dateKey() },
    ];
    expect(getPriceCategory(prices, "cheap")).toBe("budget");
    expect(getPriceCategory(prices, "premium")).toBe("premium");
  });
});
