import type {
  ActivityBreakdown,
  ActivityState,
  AlcoholEntry,
  AppState,
  DailyTotals,
  MacroTargets,
  MealEntry,
  PriceEntry,
  Profile,
  WorkoutLog,
  WorkoutProgram,
  WorkoutSet,
} from "@/types";

export const ACTIVITY_METS: Record<ActivityState, number> = { lying: 1, sitting: 1.3, standing: 2, training: 6 };
export const GOAL_EXPECTED_WEEKLY_CHANGE: Record<Profile["goal"], number> = { gain: 0.25, maintain: 0, recomp: 0, cut: -0.5 };

export const dateKey = (date = new Date()): string => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
export const daysAgoKey = (days: number): string => { const date = new Date(); date.setDate(date.getDate() - days); return dateKey(date); };
export const sumActivityHours = (profile: Profile): number => Object.values(profile.activityHours).reduce((total, hours) => total + hours, 0);
export const getActivityBreakdown = (profile: Profile): ActivityBreakdown => ({ ...profile.activityHours, total: sumActivityHours(profile) });
export const calculateBmr = (profile: Profile): number => 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + (profile.sex === "male" ? 5 : -161);
export const calculateActivityCalories = (profile: Profile): number => {
  const metHours = (Object.keys(ACTIVITY_METS) as ActivityState[]).reduce((total, state) => total + profile.activityHours[state] * ACTIVITY_METS[state], 0);
  return (calculateBmr(profile) / 24) * metHours;
};
export const calculateTargetCalories = (profile: Profile): number => Math.round(calculateActivityCalories(profile) + profile.calorieAdjustment);
export const calculateMacroTargets = (profile: Profile): MacroTargets => {
  const calories = calculateTargetCalories(profile);
  const protein = profile.weightKg * profile.proteinGPerKg;
  const fat = profile.weightKg * profile.fatGPerKg;
  return { calories, protein, fat, carbs: Math.max(0, (calories - protein * 4 - fat * 9) / 4), sugar: profile.sugarLimitG };
};
export const scaleNutrition = (calories: number, protein: number, fat: number, carbs: number, sugar: number, amountG: number) => {
  const factor = amountG / 100;
  return { calories: calories * factor, protein: protein * factor, fat: fat * factor, carbs: carbs * factor, sugar: sugar * factor };
};
export const calculateAlcoholCalories = (volumeMl: number, abv: number): number => volumeMl * (abv / 100) * 0.789 * 7.1;
export const calculateDailyTotals = (meals: MealEntry[], alcohol: AlcoholEntry[], date: string): DailyTotals => {
  const food = meals.filter((entry) => entry.date === date).reduce((totals, entry) => ({ calories: totals.calories + entry.calories, protein: totals.protein + entry.protein, fat: totals.fat + entry.fat, carbs: totals.carbs + entry.carbs, sugar: totals.sugar + entry.sugar }), { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 });
  const alcoholCalories = alcohol.filter((entry) => entry.date === date).reduce((total, entry) => total + entry.calories, 0);
  return { ...food, calories: food.calories + alcoholCalories, alcoholCalories };
};
export const calculateCardioMinutes = (excessCalories: number, weightKg: number, met: number): number => excessCalories <= 0 || weightKg <= 0 ? 0 : Math.max(5, Math.round(excessCalories / ((met * 3.5 * weightKg) / 200)));
export const getSortedWeightEntries = (weights: AppState["weights"]) => [...weights].sort((a, b) => a.date.localeCompare(b.date));
export const getSevenDayAverage = (weights: AppState["weights"], endDate: string): number | null => {
  const end = new Date(`${endDate}T12:00:00`);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  const samples = getSortedWeightEntries(weights).filter((entry) => { const date = new Date(`${entry.date}T12:00:00`); return date >= start && date <= end; });
  return samples.length >= 3 ? samples.reduce((total, entry) => total + entry.weightKg, 0) / samples.length : null;
};
export const getCalorieAdherence = (meals: MealEntry[], alcohol: AlcoholEntry[], targetCalories: number, startDaysAgo: number, endDaysAgo = 0): number => {
  const days = Array.from({ length: startDaysAgo - endDaysAgo + 1 }, (_, index) => daysAgoKey(startDaysAgo - index));
  const compliant = days.filter((date) => { const calories = calculateDailyTotals(meals, alcohol, date).calories; return calories > 0 && Math.abs(calories - targetCalories) <= targetCalories * 0.1; }).length;
  return compliant / days.length;
};
export const detectPlateau = (state: AppState, today = dateKey()): { active: boolean; weeklyChange: number; adherence: number } | null => {
  const current = getSevenDayAverage(state.weights, today);
  const previousEnd = new Date(`${today}T12:00:00`); previousEnd.setDate(previousEnd.getDate() - 7);
  const previous = getSevenDayAverage(state.weights, previousEnd.toISOString().slice(0, 10));
  if (current === null || previous === null) return null;
  const weeklyChange = current - previous;
  const adherence = getCalorieAdherence(state.meals, state.alcohol, calculateTargetCalories(state.profile), 13);
  return Math.abs(weeklyChange) > 0.2 || adherence < 0.8 ? null : { active: true, weeklyChange, adherence };
};
export const getAutoCorrection = (state: AppState, today = dateKey()): { active: boolean; suggestedAdjustment: number; observedWeeklyChange: number; expectedWeeklyChange: number; averageCalories: number } | null => {
  const start = new Date(`${today}T12:00:00`); start.setDate(start.getDate() - 6);
  const startDate = start.toISOString().slice(0, 10);
  const meals = state.meals.filter((entry) => entry.date >= startDate && entry.date <= today);
  const loggedDays = new Set(meals.map((entry) => entry.date)).size;
  const weightStart = getSevenDayAverage(state.weights, startDate);
  const weightEnd = getSevenDayAverage(state.weights, today);
  if (loggedDays < 7 || weightStart === null || weightEnd === null) return null;
  const observedWeeklyChange = weightEnd - weightStart;
  const expectedWeeklyChange = GOAL_EXPECTED_WEEKLY_CHANGE[state.profile.goal];
  const discrepancy = observedWeeklyChange - expectedWeeklyChange;
  if (Math.abs(discrepancy) <= 0.25) return null;
  const averageCalories = meals.reduce((total, entry) => total + entry.calories, 0) / loggedDays;
  const suggestedAdjustment = Math.round(Math.max(-250, Math.min(250, -discrepancy * (7700 / 7))) / 10) * 10;
  return { active: suggestedAdjustment !== 0, suggestedAdjustment, observedWeeklyChange, expectedWeeklyChange, averageCalories };
};
export const getNoJunkStreak = (meals: MealEntry[], today = dateKey()): number => {
  const byDate = meals.reduce<Record<string, MealEntry[]>>((groups, entry) => { (groups[entry.date] ??= []).push(entry); return groups; }, {});
  const current = new Date(`${today}T12:00:00`);
  let streak = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(current); date.setDate(date.getDate() - offset);
    const dayMeals = byDate[date.toISOString().slice(0, 10)];
    if (!dayMeals?.length || dayMeals.some((entry) => entry.junkFood)) break;
    streak += 1;
  }
  return streak;
};
export const getNormalizedPrice = (entry: PriceEntry): number => entry.packagePrice / (entry.packageSizeG ?? entry.packageSizeMl ?? 100) * 100;
export const getPriceCategory = (entries: PriceEntry[], entryId?: string): "budget" | "medium" | "premium" | null => {
  const matches = entries.map((entry) => ({ entry, price: getNormalizedPrice(entry) })).sort((a, b) => a.price - b.price);
  if (!matches.length) return null;
  if (matches.length === 1) return "medium";
  const target = matches.find(({ entry }) => entry.id === entryId);
  if (!target) return null;
  const position = matches.indexOf(target) / (matches.length - 1);
  return position <= 0.33 ? "budget" : position >= 0.67 ? "premium" : "medium";
};
export const getPriceCategoriesByProduct = (entries: PriceEntry[], productId?: string): "budget" | "medium" | "premium" | null => {
  if (!productId) return null;
  const matches = entries.filter((entry) => entry.productId === productId).map((entry) => ({ entry, price: getNormalizedPrice(entry) })).sort((a, b) => a.price - b.price);
  if (!matches.length) return null;
  if (matches.length === 1) return "medium";
  const midpoint = (matches[0]!.price + matches.at(-1)!.price) / 2;
  return matches.some(({ price }) => price < midpoint) ? "budget" : "premium";
};
export const getNextWorkoutRecommendation = (program: WorkoutProgram, log?: WorkoutLog): Record<string, number> => {
  const completed = new Map<string, WorkoutSet[]>();
  log?.sets.forEach((set) => completed.set(set.exercise, [...(completed.get(set.exercise) ?? []), set]));
  return program.days.flatMap((day) => day.exercises).reduce<Record<string, number>>((result, exercise) => {
    const sets = completed.get(exercise.name) ?? [];
    const currentWeight = sets.at(-1)?.weightKg ?? 0;
    let nextWeight = currentWeight;
    if (program.type === "startingStrength") nextWeight = currentWeight + (currentWeight < 100 ? 2.5 : 5);
    else if (program.type === "ppl") { const target = Number(exercise.reps.split("–").at(-1) ?? "8"); nextWeight = sets.length > 0 && sets.every((set) => set.reps >= target) ? currentWeight + 2.5 : currentWeight; }
    else if (program.type === "juggernaut") nextWeight = sets.length > 0 && (sets.at(-1)?.rpe ?? 10) <= 8 ? currentWeight + 2.5 : currentWeight;
    else nextWeight = Math.max(currentWeight + 2.5, (program.trainingMaxes?.[exercise.name] ?? currentWeight) * 0.9);
    result[exercise.name] = Math.round(nextWeight * 2) / 2;
    return result;
  }, {});
};
