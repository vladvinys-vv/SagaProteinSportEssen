import { describe, expect, it } from "vitest";
import { createEmptyState } from "@/data/demo";
import {
  calculateDailyTotals,
  calculateMacroTargets,
  calculateRecoveryPlan,
  dateKey,
  daysAgoKey,
  GOAL_CALORIE_ADJUSTMENTS,
  getAlcoholImpact,
  getAutoCorrection,
  getFoodRecommendations,
  getPeriodNutritionSummary,
  getPriceCategory,
  getProductPriceCategory,
  getProteinAdherence,
  getRecipeRecommendations,
  getStreakReward,
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

  it("строит план восстановления при переборе", () => {
    const plan = calculateRecoveryPlan(700, 75, 2400);
    expect(plan).not.toBeNull();
    expect(plan?.strict.days).toBe(2);
    expect(plan?.soft.days).toBe(2);
    expect(plan?.cardio.every((option) => option.minutes >= 5)).toBe(true);
    expect(plan?.strict.meal).toContain("Фруктовый салат");
  });

  it("подбирает продукты и рецепты под цель", () => {
    const foods = [
      { id: "protein", name: "Курица", category: "Птица", calories: 165, protein: 31, fat: 3.6, carbs: 0, sugar: 0, unit: "g" as const },
      { id: "light", name: "Брокколи", category: "Овощи", calories: 35, protein: 2.4, fat: 0.4, carbs: 7, sugar: 1.7, unit: "g" as const },
    ];
    const prices: PriceEntry[] = [{ id: "protein-price", productId: "protein", productName: "Курица", store: "А", city: "Москва", currency: "RUB", packagePrice: 400, packageSizeG: 1000, date: dateKey() }];
    const targets = { calories: 2200, protein: 140, fat: 70, carbs: 200, sugar: 40 };
    const recommendations = getFoodRecommendations(foods, prices, targets, "medium", "protein");
    expect(recommendations[0]?.food.id).toBe("protein");
    const recipes = [{ id: "bowl", name: "Боул", description: "", ingredients: ["Курица"], foodIds: ["protein"], calories: 500, protein: 45, fat: 12, carbs: 50, sugar: 0, instructions: [], tags: [] }];
    expect(getRecipeRecommendations(recipes, ["protein"], targets, "protein")[0]?.matchedFoodIds).toEqual(["protein"]);
  });

  it("категоризирует продукты по самой дешёвой цене", () => {
    const prices: PriceEntry[] = [
      { id: "oats", productId: "oats", productName: "Овсянка", store: "А", city: "Москва", currency: "RUB", packagePrice: 100, packageSizeG: 1000, date: dateKey() },
      { id: "chicken-cheap", productId: "chicken", productName: "Курица", store: "А", city: "Москва", currency: "RUB", packagePrice: 300, packageSizeG: 1000, date: dateKey() },
      { id: "chicken-expensive", productId: "chicken", productName: "Курица", store: "Б", city: "Москва", currency: "RUB", packagePrice: 900, packageSizeG: 1000, date: dateKey() },
      { id: "salmon", productId: "salmon", productName: "Лосось", store: "А", city: "Москва", currency: "RUB", packagePrice: 1500, packageSizeG: 1000, date: dateKey() },
    ];
    expect(getProductPriceCategory(prices, "oats")).toBe("budget");
    expect(getProductPriceCategory(prices, "chicken")).toBe("medium");
    expect(getProductPriceCategory(prices, "salmon")).toBe("premium");
  });

  it("считает влияние алкоголя и соблюдение белка", () => {
    const today = dateKey();
    const meals: MealEntry[] = [
      { id: "one", date: today, meal: "breakfast", name: "Продукт", amountG: 100, calories: 300, protein: 30, fat: 5, carbs: 30, sugar: 2, source: "database", junkFood: false },
      { id: "two", date: daysAgoKey(1), meal: "breakfast", name: "Продукт", amountG: 100, calories: 300, protein: 10, fat: 5, carbs: 30, sugar: 2, source: "database", junkFood: false },
    ];
    expect(getAlcoholImpact(200, 2000, 140, 80)).toMatchObject({ percentOfTarget: 0.1, remainingCalories: 1800, remainingProtein: 60 });
    expect(getProteinAdherence(meals, 20, 1)).toMatchObject({ loggedDays: 2, compliantDays: 1, rate: 0.5 });
    expect(getPeriodNutritionSummary(meals, [], [], { calories: 2000, protein: 20, fat: 60, carbs: 200, sugar: 40 }, 1).averageProtein).toBeGreaterThan(0);
  });

  it("возвращает конкретную награду streak с учётом остатка плана", () => {
    const reward = getStreakReward(7, { calories: 2200, protein: 140, fat: 70, carbs: 200, sugar: 40 }, { calories: 1900, protein: 115, fat: 50, carbs: 180, sugar: 20, alcoholCalories: 0 });
    expect(reward?.milestone).toBe(7);
    expect(reward?.fitsPlan).toBe(true);
    expect(reward?.calories).toBeGreaterThan(0);
    expect(reward?.protein).toBeGreaterThan(0);
  });
});
