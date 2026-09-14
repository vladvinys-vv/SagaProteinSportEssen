import { FOOD_CATALOG } from "./constants";
import type {
  AlcoholEntry,
  DailyActivity,
  DailySummary,
  DailyTotals,
  FitnessGoal,
  FitnessState,
  FoodEntry,
  FoodItem,
  Profile,
  WeightEntry,
} from "./types";

const MET_VALUES = {
  lying: 0.95,
  sitting: 1.2,
  standing: 1.5,
  training: 5.5,
} as const;

const GOAL_CALORIE_FACTORS: Record<FitnessGoal, number> = {
  cut: 0.85,
  maintain: 1,
  gain: 1.1,
  recomp: 1,
};

const PROTEIN_PER_KG: Record<FitnessGoal, number> = {
  cut: 1.8,
  maintain: 1.8,
  gain: 2,
  recomp: 2,
};

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const todayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const normalizeActivity = (activity: DailyActivity): DailyActivity => {
  const rawTotal = activity.lyingHours + activity.sittingHours + activity.standingHours + activity.trainingHours;
  if (rawTotal <= 0) {
    return { lyingHours: 8, sittingHours: 8, standingHours: 8, trainingHours: 0, steps: activity.steps ?? 0 };
  }

  if (rawTotal > 24) {
    const factor = 24 / rawTotal;
    return {
      lyingHours: round(activity.lyingHours * factor, 2),
      sittingHours: round(activity.sittingHours * factor, 2),
      standingHours: round(activity.standingHours * factor, 2),
      trainingHours: round(activity.trainingHours * factor, 2),
      steps: activity.steps ?? 0,
    };
  }

  const missingHours = 24 - rawTotal;
  return {
    ...activity,
    sittingHours: round(activity.sittingHours + missingHours, 2),
    steps: activity.steps ?? 0,
  };
};

export const calculateBmr = (profile: Profile) => {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return Math.round(profile.sex === "male" ? base + 5 : base - 161);
};

export const calculateActivityCalories = (profile: Profile, activity: DailyActivity) => {
  const normalized = normalizeActivity(activity);
  const hours: Array<keyof typeof MET_VALUES> = ["lying", "sitting", "standing", "training"];
  const values = {
    lying: normalized.lyingHours,
    sitting: normalized.sittingHours,
    standing: normalized.standingHours,
    training: normalized.trainingHours,
  };

  return Math.round(
    hours.reduce((sum, key) => {
      const metAboveRest = Math.max(0, MET_VALUES[key] - 1);
      return sum + metAboveRest * 3.5 * profile.weightKg * 60 * values[key] / 200;
    }, 0),
  );
};

export const calculateTargetCalories = (profile: Profile, activity: DailyActivity, adjustmentKcal = 0) => {
  const bmr = calculateBmr(profile);
  const activityCalories = calculateActivityCalories(profile, activity);
  const maintenance = bmr + activityCalories + adjustmentKcal;
  return Math.round(maintenance * GOAL_CALORIE_FACTORS[profile.goal]);
};

export const calculateMacros = (profile: Profile, targetCalories: number) => {
  const protein = Math.round(profile.weightKg * PROTEIN_PER_KG[profile.goal]);
  const fat = Math.round(profile.weightKg * 0.8);
  const carbs = Math.max(0, Math.round((targetCalories - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
};

export const calculateAlcoholCalories = (entry: AlcoholEntry) => {
  const grams = entry.volumeMl * (entry.abv / 100) * 0.789;
  return Math.round(grams * 7);
};

export const calculateDailyTotals = (
  entries: FoodEntry[],
  foods: FoodItem[],
  alcoholEntries: AlcoholEntry[],
): DailyTotals => {
  const foodTotals = entries.reduce(
    (totals, entry) => {
      const food = foods.find((item) => item.id === entry.foodId);
      if (!food) return totals;
      const multiplier = (food.servingG * entry.quantity) / 100;
      return {
        calories: totals.calories + food.calories * multiplier,
        protein: totals.protein + food.protein * multiplier,
        fat: totals.fat + food.fat * multiplier,
        carbs: totals.carbs + food.carbs * multiplier,
        sugar: totals.sugar + food.sugar * multiplier,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 },
  );

  const alcoholCalories = alcoholEntries.reduce((sum, entry) => sum + calculateAlcoholCalories(entry), 0);

  return {
    calories: Math.round(foodTotals.calories + alcoholCalories),
    protein: round(foodTotals.protein, 1),
    fat: round(foodTotals.fat, 1),
    carbs: round(foodTotals.carbs, 1),
    sugar: round(foodTotals.sugar, 1),
    alcoholCalories,
  };
};

export const calculateDailySummary = (
  profile: Profile,
  activity: DailyActivity,
  entries: FoodEntry[],
  foods: FoodItem[],
  alcoholEntries: AlcoholEntry[],
  adjustmentKcal = 0,
): DailySummary => {
  const bmr = calculateBmr(profile);
  const activityCalories = calculateActivityCalories(profile, activity);
  const targetCalories = calculateTargetCalories(profile, activity, adjustmentKcal);
  const macros = calculateMacros(profile, targetCalories);
  const totals = calculateDailyTotals(entries, foods, alcoholEntries);
  const balance = totals.calories - targetCalories;

  return {
    targetCalories,
    bmr,
    activityCalories,
    totals,
    remaining: {
      calories: Math.round(targetCalories - totals.calories),
      protein: round(macros.protein - totals.protein, 1),
      fat: round(macros.fat - totals.fat, 1),
      carbs: round(macros.carbs - totals.carbs, 1),
      sugar: round(50 - totals.sugar, 1),
      alcoholCalories: 0,
    },
    balance,
    status: balance > 100 ? "surplus" : balance < -100 ? "deficit" : "maintenance",
    proteinPerKg: round(totals.protein / profile.weightKg, 2),
  };
};

export const calculateCardioMinutes = (surplusKcal: number, profile: Profile, mode: "walking" | "running" = "walking") => {
  if (surplusKcal <= 0) return 0;
  const met = mode === "running" ? 8 : 3.5;
  const kcalPerMinute = Math.max(1, (met - 1) * 3.5 * profile.weightKg * 60 / 200);
  return Math.ceil(surplusKcal / kcalPerMinute);
};

export const calculateDeficitPlan = (surplusKcal: number, targetCalories: number) => {
  if (surplusKcal <= 0) return null;
  const strictDailyDeficit = 500;
  const softDailyDeficit = 250;
  const strictDays = Math.max(1, Math.ceil(surplusKcal / strictDailyDeficit));
  const softDays = Math.max(1, Math.ceil(surplusKcal / softDailyDeficit));
  return {
    strict: { days: strictDays, dailyCalories: Math.max(1200, targetCalories - strictDailyDeficit) },
    soft: { days: softDays, dailyCalories: Math.max(1200, targetCalories - softDailyDeficit) },
  };
};

export const calculateJokerStreak = (state: FitnessState, foods: FoodItem[], date = todayKey()) => {
  const foodMap = new Map(foods.map((food) => [food.id, food]));
  let streak = 0;
  let cursor = new Date(`${date}T12:00:00`);

  while (true) {
    const key = todayKey(cursor);
    const dayEntries = state.foodEntries.filter((entry) => entry.date === key);
    const hasJunk = dayEntries.some((entry) => foodMap.get(entry.foodId)?.isJunk);
    if (hasJunk || dayEntries.length === 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export const calculatePlateau = (weights: WeightEntry[], entries: FoodEntry[], foods: FoodItem[], targetCalories: number) => {
  if (weights.length < 10) return null;
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-14);
  if (recent.length < 10) return null;
  const first = recent[0].weightKg;
  const last = recent[recent.length - 1].weightKg;
  const changePercent = ((last - first) / first) * 100;
  const recentDates = new Set(recent.map((entry) => entry.date));
  const adherence = entries.filter((entry) => recentDates.has(entry.date)).length / recent.length;
  if (Math.abs(changePercent) < 0.7 && adherence >= 0.7) {
    return { changePercent, adherence, targetCalories: Math.round(targetCalories * 0.95) };
  }
  return null;
};

export const calculateAutoAdjustment = (
  profile: Profile,
  weights: WeightEntry[],
  entries: FoodEntry[],
  foods: FoodItem[],
  alcoholEntries: AlcoholEntry[],
  currentAdjustment = 0,
) => {
  const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  if (sortedWeights.length < 7) return 0;
  const firstWeight = sortedWeights[0];
  const lastWeight = sortedWeights[sortedWeights.length - 1];
  const days = Math.max(1, Math.round((new Date(`${lastWeight.date}T12:00:00`).getTime() - new Date(`${firstWeight.date}T12:00:00`).getTime()) / 86400000));
  const dates = new Set(sortedWeights.map((entry) => entry.date));
  const dayIntakes = sortedWeights.map((weight) => {
    const totals = calculateDailyTotals(entries.filter((entry) => entry.date === weight.date), foods, alcoholEntries.filter((entry) => entry.date === weight.date));
    return totals.calories;
  });
  const avgIntake = dayIntakes.reduce((sum, value) => sum + value, 0) / dayIntakes.length;
  const actualDeltaKg = lastWeight.weightKg - firstWeight.weightKg;
  const expectedDeltaKg = ((avgIntake - calculateTargetCalories(profile, { lyingHours: 8, sittingHours: 8, standingHours: 8, trainingHours: 0 }, currentAdjustment)) * days) / 7700;
  const discrepancyKg = actualDeltaKg - expectedDeltaKg;
  const recommendation = Math.round((-discrepancyKg * 7700 / days) * 0.5 / 25) * 25;
  return clamp(recommendation, -300, 300);
};

export const getAvailableFoods = (state: FitnessState) => [...state.customFoods, ...FOOD_CATALOG];

export const formatNumber = (value: number, digits = 0) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);

export const goalLabels: Record<FitnessGoal, string> = {
  cut: "Сушка",
  maintain: "Поддержание",
  gain: "Набор",
  recomp: "Рекомпозиция",
};

export const tabLabels = {
  nutrition: "Питание",
  training: "Тренировки",
  progress: "Прогресс",
  profile: "Профиль",
} as const;
