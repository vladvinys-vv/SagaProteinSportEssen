import { describe, expect, it } from "vitest";
import { createDemoState, createEmptyState } from "@/data/demo";
import { calculateMacroTargets, dateKey, daysAgoKey, sumActivityHours } from "@/lib/calculations";

describe("демо- и пустое состояние", () => {
  it("демо-состояние пригодно для расчётов", () => {
    const state = createDemoState();
    expect(sumActivityHours(state.profile)).toBe(24);
    expect(state.weights).toHaveLength(14);
    expect(state.meals.length).toBeGreaterThan(150);
    expect(state.alcohol).toHaveLength(3);
    expect(state.foods.filter((food) => food.treat).length).toBeGreaterThanOrEqual(6);
    expect(state.presets).toHaveLength(1);
    expect(state.recipes.length).toBeGreaterThan(0);
    expect(state.programs.length).toBeGreaterThan(0);
    expect(state.workoutLogs).toHaveLength(1);
    expect(state.prices.length).toBeGreaterThanOrEqual(15);
    expect(new Set(state.prices.map((entry) => entry.store)).size).toBeGreaterThanOrEqual(5);

    const ids = state.meals.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);

    const window = new Set(Array.from({ length: 14 }, (_, index) => daysAgoKey(index)));
    state.meals.forEach((entry) => {
      expect(window.has(entry.date)).toBe(true);
      expect(Number.isFinite(entry.calories)).toBe(true);
      expect(entry.calories).toBeGreaterThan(0);
      expect(entry.protein).toBeGreaterThanOrEqual(0);
      expect(entry.sugar).toBeGreaterThanOrEqual(0);
    });
  });

  it("демо-профиль целится в достижимую норму калорий", () => {
    const state = createDemoState();
    const targets = calculateMacroTargets(state.profile);
    expect(targets.calories).toBeGreaterThan(1500);
    expect(targets.calories).toBeLessThan(4000);
    expect(targets.protein).toBeCloseTo(state.profile.weightKg * state.profile.proteinGPerKg, 5);
    expect(targets.carbs).toBeGreaterThan(0);
    expect(state.weights.some((entry) => entry.date === dateKey())).toBe(true);
  });

  it("пустое состояние не содержит записей и требует онбординга", () => {
    const state = createEmptyState();
    expect(state.profile.completed).toBe(false);
    expect(state.meals).toEqual([]);
    expect(state.weights).toEqual([]);
    expect(state.prices).toEqual([]);
    expect(state.adjustments).toEqual([]);
    expect(sumActivityHours(state.profile)).toBe(24);
  });
});
