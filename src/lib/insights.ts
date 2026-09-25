import { GOAL_CALORIE_ADJUSTMENTS, getNormalizedPrice } from "@/lib/calculations";
import type {
  AlcoholEntry,
  AlcoholStagnation,
  Currency,
  Food,
  Goal,
  MacroTargets,
  PriceEntry,
  ProductPriceComparison,
  Profile,
  StoreOffer,
  StoreRanking,
  TreatSuggestion,
  TreatTier,
} from "@/types";

/** Калорийность стандартной дозы алкоголя: 10 г этанола × 7 ккал. */
export const ALCOHOL_CALORIES_PER_DRINK = 70;

/** 1 кг жировой массы ≈ 7700 ккал. */
export const CALORIES_PER_KG_FAT = 7700;

/** Ориентир «одного дня прогресса», если цель не задаёт дефицит сама. */
export const DEFAULT_PROGRESS_DAY_KCAL = 250;

const dateWindow = (days: number): Set<string> => {
  const keys = new Set<string>();
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    keys.add(new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10));
  }
  return keys;
};

const goalLabels: Record<Goal, string> = { cut: "сушку", gain: "набор", recomp: "рекомпозицию", maintain: "поддержание" };

/**
 * Оценивает, насколько алкоголь тормозит прогресс: калории, стандартные дозы,
 * эквивалент в жире и потерянные «дни прогресса» относительно плановой коррекции.
 */
export const getAlcoholStagnation = (
  alcohol: AlcoholEntry[],
  profile: Profile,
  days = 14,
): AlcoholStagnation => {
  const window = dateWindow(days);
  const period = alcohol.filter((entry) => window.has(entry.date));
  const totalCalories = period.reduce((total, entry) => total + Math.max(0, entry.calories), 0);
  const standardDrinks = totalCalories / ALCOHOL_CALORIES_PER_DRINK;
  const drinksPerWeek = (standardDrinks / days) * 7;

  const goalAdjustment = GOAL_CALORIE_ADJUSTMENTS[profile.goal];
  const dailyBudget = goalAdjustment < 0 ? Math.abs(goalAdjustment) : DEFAULT_PROGRESS_DAY_KCAL;
  const delayedDays = totalCalories / dailyBudget;

  const maxDrinksPerDay = period.reduce<Record<string, number>>((perDay, entry) => {
    perDay[entry.date] = (perDay[entry.date] ?? 0) + Math.max(0, entry.calories) / ALCOHOL_CALORIES_PER_DRINK;
    return perDay;
  }, {});
  const heaviestDay = Math.max(0, ...Object.values(maxDrinksPerDay));

  const status: AlcoholStagnation["status"] =
    standardDrinks <= 0 ? "none" : drinksPerWeek >= 14 || heaviestDay >= 5 ? "risk" : drinksPerWeek >= 7 || heaviestDay >= 3 ? "watch" : "none";

  const goalLabel = goalLabels[profile.goal];
  const message =
    standardDrinks <= 0
      ? `Алкоголя за ${days} дней нет — прогресс идёт без помех.`
      : status === "risk"
        ? `${standardDrinks.toFixed(1)} доз за ${days} дней (≈${drinksPerWeek.toFixed(1)} в неделю) отнимают ${delayedDays.toFixed(1)} дня прогресса и мешают ${goalLabel}. Самый тяжёлый день: ${heaviestDay.toFixed(1)} доз.`
        : `${standardDrinks.toFixed(1)} доз за ${days} дней стоят ${Math.round(totalCalories)} ккал — это ${delayedDays.toFixed(1)} дня без движения к цели (${goalLabel}).`;

  return {
    days,
    standardDrinks: Math.round(standardDrinks * 10) / 10,
    totalCalories: Math.round(totalCalories),
    drinksPerWeek: Math.round(drinksPerWeek * 10) / 10,
    fatEquivalentG: Math.round((totalCalories / CALORIES_PER_KG_FAT) * 1000),
    delayedDays: Math.round(delayedDays * 10) / 10,
    dailyBudget,
    status,
    goalLabel,
    message,
  };
};

/**
 * Лестница вкусняшек: чем длиннее серия дней без джанк-фуда,
 * тем больше бюджет на десерт. Значения — ступени, а не кумулятив.
 */
export const TREAT_LADDER: TreatTier[] = [
  { day: 1, name: "Фруктовый салат", budgetCalories: 120, budgetProtein: 3, label: "первый чистый день" },
  { day: 2, name: "Ягоды с греческим йогуртом", budgetCalories: 180, budgetProtein: 12, label: "два дня подряд" },
  { day: 3, name: "Протеиновое мороженое", budgetCalories: 240, budgetProtein: 20, label: "три дня подряд" },
  { day: 5, name: "Тёмный шоколад с орехами", budgetCalories: 320, budgetProtein: 8, label: "пять дней" },
  { day: 7, name: "Творожный десерт", budgetCalories: 400, budgetProtein: 25, label: "неделя без джанка" },
  { day: 10, name: "Панна-котта на протеине", budgetCalories: 500, budgetProtein: 28, label: "десять дней" },
  { day: 14, name: "Домашняя выпечка без сахара", budgetCalories: 620, budgetProtein: 20, label: "две недели" },
  { day: 21, name: "Десерт в кафе", budgetCalories: 750, budgetProtein: 12, label: "три недели" },
  { day: 30, name: "Свободный приём пищи", budgetCalories: 900, budgetProtein: 30, label: "месяц" },
];

/** Текущая ступень вкусняшек по серии чистых дней. */
export const getTreatTier = (streak: number): TreatTier | null => {
  if (streak < 1) return null;
  return TREAT_LADDER.filter((tier) => tier.day <= streak).at(-1) ?? null;
};

/** Следующая ступень — мотивация продолжать серию. */
export const getNextTreatTier = (streak: number): TreatTier | null =>
  TREAT_LADDER.find((tier) => tier.day > streak) ?? null;

/**
 * Подбирает десерты, которые впишутся в остаток дня.
 * Порция считается так, чтобы не выйти за бюджет калорий ступени.
 */
export const getTreatSuggestions = (
  foods: Food[],
  budgetCalories: number,
  budgetProtein: number,
  limit = 4,
): TreatSuggestion[] => {
  if (budgetCalories <= 0) return [];
  return foods
    .filter((food) => food.treat && food.calories > 0)
    .map((food) => {
      const maxPortion = (budgetCalories / food.calories) * 100;
      const portionG = Math.max(20, Math.floor(Math.min(250, maxPortion) / 5) * 5);
      const factor = portionG / 100;
      const calories = Math.round(food.calories * factor);
      const protein = Math.round(food.protein * factor * 10) / 10;
      const fits = calories <= budgetCalories;
      const fitsProtein = protein >= budgetProtein * 0.5;
      const reason = fits
        ? fitsProtein
          ? `${portionG} г · белка ${protein} г, вписывается в остаток дня`
          : `${portionG} г · без белка, но в остатке ещё ${Math.round(budgetCalories - calories)} ккал`
        : `Порция ${portionG} г превысит бюджет на ${calories - budgetCalories} ккал`;
      return { food, portionG, calories, protein, fits, reason };
    })
    .filter((suggestion) => suggestion.fits)
    .sort((a, b) => {
      const proteinScore = b.protein - a.protein;
      return proteinScore !== 0 ? proteinScore : b.calories - a.calories;
    })
    .slice(0, limit);
};

/** Ключ продукта: id из базы, иначе нормализованное название. */
const priceKey = (entry: PriceEntry): string => entry.productId ?? entry.productName.trim().toLowerCase();

const toOffer = (entry: PriceEntry): StoreOffer => ({
  entryId: entry.id,
  store: entry.store,
  city: entry.city,
  currency: entry.currency,
  price: entry.packagePrice,
  normalizedPrice: getNormalizedPrice(entry),
  packageSize: entry.packageSizeG ?? entry.packageSizeMl,
  date: entry.date,
});

/**
 * Сравнивает цены на один и тот же продукт между магазинами:
 * где дешевле всего и где изысканнее всего (самое дорогое предложение).
 */
export const getPriceComparisons = (entries: PriceEntry[]): ProductPriceComparison[] => {
  const groups = new Map<string, PriceEntry[]>();
  entries.forEach((entry) => {
    const key = priceKey(entry);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  });

  return [...groups.entries()]
    .map(([key, group]) => {
      const offers = group.map(toOffer).sort((a, b) => a.normalizedPrice - b.normalizedPrice);
      const cheapest = offers[0]!;
      const priciest = offers.at(-1)!;
      const average = offers.reduce((total, offer) => total + offer.normalizedPrice, 0) / offers.length;
      const unit: "г" | "мл" = group.some((entry) => entry.packageSizeMl !== undefined) ? "мл" : "г";
      return {
        key,
        productName: group[0]!.productName,
        unit,
        offers,
        cheapest,
        priciest,
        average,
        spreadPercent: cheapest.normalizedPrice > 0 ? Math.round((priciest.normalizedPrice / cheapest.normalizedPrice - 1) * 100) : 0,
        savings: Math.round((priciest.price - cheapest.price) * 100) / 100,
      };
    })
    .sort((a, b) => b.spreadPercent - a.spreadPercent);
};

/**
 * Рейтинг магазинов: кто чаще всего оказывается самым дешёвым
 * и насколько его цены в среднем выше лучших.
 */
export const getStoreRankings = (entries: PriceEntry[]): StoreRanking[] => {
  const comparisons = getPriceComparisons(entries);
  const stats = new Map<string, { store: string; city: string; wins: number; entries: number; indexSum: number }>();

  comparisons.forEach((comparison) => {
    comparison.offers.forEach((offer) => {
      const current = stats.get(offer.store) ?? { store: offer.store, city: offer.city, wins: 0, entries: 0, indexSum: 0 };
      current.entries += 1;
      current.indexSum += comparison.cheapest.normalizedPrice > 0 ? (offer.normalizedPrice / comparison.cheapest.normalizedPrice) * 100 : 100;
      stats.set(offer.store, current);
    });
    const winner = stats.get(comparison.cheapest.store);
    if (winner) winner.wins += 1;
  });

  return [...stats.values()]
    .map((item) => ({ ...item, averageIndex: Math.round(item.indexSum / item.entries) }))
    .sort((a, b) => b.wins - a.wins || a.averageIndex - b.averageIndex);
};

/** Итоговая выгода, если покупать всё по лучшим ценам. */
export const getShoppingSavings = (entries: PriceEntry[]): { products: number; stores: string[]; savings: number } => {
  const comparisons = getPriceComparisons(entries);
  const stores = [...new Set(comparisons.map((comparison) => comparison.cheapest.store))];
  return {
    products: comparisons.length,
    stores,
    savings: Math.round(comparisons.reduce((total, comparison) => total + comparison.savings, 0) * 100) / 100,
  };
};

/** Валюта сравнения — берём самую частую среди наблюдений. */
export const getDominantCurrency = (entries: PriceEntry[]): Currency => {
  const counts = entries.reduce<Record<string, number>>((result, entry) => {
    result[entry.currency] = (result[entry.currency] ?? 0) + 1;
    return result;
  }, {});
  const [currency] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? ["RUB"];
  return currency as Currency;
};

/** Остаток дня в калориях и белке — используется и вкусняшками, и подсказками. */
export const getDailyRemaining = (targets: MacroTargets, consumedCalories: number, consumedProtein: number) => ({
  calories: Math.max(0, targets.calories - consumedCalories),
  protein: Math.max(0, targets.protein - consumedProtein),
});
