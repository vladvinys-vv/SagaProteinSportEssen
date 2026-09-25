import { describe, expect, it } from "vitest";
import { BASE_FOODS, createEmptyState } from "@/data/demo";
import { calculateAlcoholCalories, dateKey, daysAgoKey } from "@/lib/calculations";
import {
  ALCOHOL_CALORIES_PER_DRINK,
  getAlcoholStagnation,
  getDailyRemaining,
  getDominantCurrency,
  getNextTreatTier,
  getPriceComparisons,
  getShoppingSavings,
  getStoreRankings,
  getTreatSuggestions,
  getTreatTier,
} from "@/lib/insights";
import type { AlcoholEntry, PriceEntry, Profile } from "@/types";

const profile: Profile = createEmptyState().profile;

const alcoholEntry = (daysAgo: number, calories: number, name = "Пиво"): AlcoholEntry => ({
  id: `alcohol-${daysAgo}-${calories}`,
  date: daysAgoKey(daysAgo),
  name,
  volumeMl: 500,
  abv: 4.8,
  calories,
});

const priceEntry = (id: string, productId: string, productName: string, store: string, packagePrice: number, packageSizeG = 1000): PriceEntry => ({
  id,
  productId,
  productName,
  store,
  city: "Гамбург",
  currency: "EUR",
  packagePrice,
  packageSizeG,
  date: dateKey(),
});

describe("счётчик алкоголя", () => {
  it("без алкоголя прогресс не тормозится", () => {
    const stagnation = getAlcoholStagnation([], { ...profile, goal: "cut" }, 14);
    expect(stagnation.status).toBe("none");
    expect(stagnation.standardDrinks).toBe(0);
    expect(stagnation.delayedDays).toBe(0);
    expect(stagnation.message).toContain("без помех");
  });

  it("переводит калории в дозы и потерянные дни прогресса", () => {
    // 700 ккал = 10 стандартных доз; при сушке (−450 ккал/день) это 1.6 дня
    const entries = [alcoholEntry(1, 700)];
    const stagnation = getAlcoholStagnation(entries, { ...profile, goal: "cut" }, 14);
    expect(ALCOHOL_CALORIES_PER_DRINK).toBe(70);
    expect(stagnation.standardDrinks).toBe(10);
    expect(stagnation.totalCalories).toBe(700);
    expect(stagnation.dailyBudget).toBe(450);
    expect(stagnation.delayedDays).toBe(1.6);
    expect(stagnation.drinksPerWeek).toBe(5);
    expect(stagnation.message).toContain("сушке");
  });

  it("для целей без дефицита считает день прогресса по 250 ккал", () => {
    const stagnation = getAlcoholStagnation([alcoholEntry(3, 500)], { ...profile, goal: "maintain" }, 14);
    expect(stagnation.dailyBudget).toBe(250);
    expect(stagnation.delayedDays).toBe(2);
  });

  it("поднимает риск при частых и тяжёлых днях", () => {
    const heavy = Array.from({ length: 4 }, (_, index) => alcoholEntry(index, calculateAlcoholCalories(700, 40)));
    expect(getAlcoholStagnation(heavy, profile, 14).status).toBe("risk");
    expect(getAlcoholStagnation([alcoholEntry(0, 140)], profile, 14).status).toBe("none");
  });

  it("игнорирует записи вне окна анализа", () => {
    const stagnation = getAlcoholStagnation([alcoholEntry(40, 700)], profile, 14);
    expect(stagnation.totalCalories).toBe(0);
    expect(stagnation.fatEquivalentG).toBe(0);
  });
});

describe("лестница вкусняшек", () => {
  it("растёт вместе с серией чистых дней", () => {
    expect(getTreatTier(0)).toBeNull();
    expect(getTreatTier(1)?.budgetCalories).toBe(120);
    expect(getTreatTier(3)?.name).toContain("мороженое");
    expect(getTreatTier(10)?.budgetCalories).toBeGreaterThan(getTreatTier(3)!.budgetCalories);
    expect(getTreatTier(30)?.budgetCalories).toBe(900);
    expect(getTreatTier(45)?.day).toBe(30);
  });

  it("показывает следующую ступень для мотивации", () => {
    expect(getNextTreatTier(2)?.day).toBe(3);
    expect(getNextTreatTier(30)).toBeNull();
  });

  it("подбирает десерты, которые вписываются в остаток дня", () => {
    const suggestions = getTreatSuggestions(BASE_FOODS, 240, 20);
    expect(suggestions.length).toBeGreaterThan(0);
    suggestions.forEach((suggestion) => {
      expect(suggestion.food.treat).toBe(true);
      expect(suggestion.calories).toBeLessThanOrEqual(240);
      expect(suggestion.portionG).toBeGreaterThanOrEqual(20);
    });
    expect(suggestions[0]!.protein).toBeGreaterThanOrEqual(suggestions.at(-1)!.protein);
  });

  it("не предлагает ничего при исчерпанном бюджете", () => {
    expect(getTreatSuggestions(BASE_FOODS, 0, 20)).toEqual([]);
    expect(getTreatSuggestions(BASE_FOODS.filter((food) => !food.treat), 400, 20)).toEqual([]);
  });

  it("считает остаток дня", () => {
    const remaining = getDailyRemaining({ calories: 2400, protein: 150, fat: 70, carbs: 250, sugar: 40 }, 2500, 100);
    expect(remaining).toEqual({ calories: 0, protein: 50 });
  });
});

describe("сравнение цен по магазинам", () => {
  const prices: PriceEntry[] = [
    priceEntry("a", "chicken", "Куриная грудка", "Aldi Nord", 3.49, 500),
    priceEntry("b", "chicken", "Куриная грудка", "Rewe", 4.29, 500),
    priceEntry("c", "chicken", "Куриная грудка", "Alnatura", 11.99, 500),
    priceEntry("d", "oats", "Овсянка", "Lidl", 0.79, 500),
    priceEntry("e", "oats", "Овсянка", "denn's Biomarkt", 2.29, 500),
  ];

  it("находит дешёвый и изысканный вариант по каждому продукту", () => {
    const [chicken] = getPriceComparisons(prices);
    expect(chicken.key).toBe("chicken");
    expect(chicken.cheapest.store).toBe("Aldi Nord");
    expect(chicken.cheapest.normalizedPrice).toBeCloseTo(0.698, 5);
    expect(chicken.priciest.store).toBe("Alnatura");
    expect(chicken.spreadPercent).toBe(244);
    expect(chicken.savings).toBe(8.5);
    expect(chicken.average).toBeCloseTo(1.318, 5);
  });

  it("сортирует продукты по разбросу цен и ранжирует магазины", () => {
    const comparisons = getPriceComparisons(prices);
    expect(comparisons[0]!.key).toBe("chicken");

    const rankings = getStoreRankings(prices);
    // Дешёвые Aldi Nord и Lidl выигрывают по одному продукту, био-маркет — ни одного
    expect(rankings[0]!.store).toBe("Aldi Nord");
    expect(rankings.slice(0, 3).map((item) => item.store).sort()).toEqual(["Aldi Nord", "Lidl", "Rewe"]);
    expect(rankings.find((item) => item.store === "Rewe")!.wins).toBe(0);
    expect(rankings.find((item) => item.store === "Alnatura")!.wins).toBe(0);
    expect(rankings.find((item) => item.store === "Alnatura")!.averageIndex).toBeGreaterThan(150);
    expect(rankings.find((item) => item.store === "denn's Biomarkt")!.averageIndex).toBeGreaterThan(250);
  });

  it("считает экономию при покупке по лучшим ценам", () => {
    const savings = getShoppingSavings(prices);
    expect(savings.products).toBe(2);
    expect(savings.savings).toBeCloseTo(8.5 + 1.5, 5);
    expect(savings.stores.sort()).toEqual(["Aldi Nord", "Lidl"]);
  });

  it("определяет доминирующую валюту наблюдений", () => {
    expect(getDominantCurrency(prices)).toBe("EUR");
    expect(getDominantCurrency([...prices, { ...priceEntry("f", "x", "X", "store", 10), currency: "RUB", id: "f" }])).toBe("EUR");
    expect(getDominantCurrency([])).toBe("EUR");
  });
});
