import type {
  ActivityBreakdown,
  ActivityState,
  AlcoholEntry,
  AppState,
  DailyTotals,
  Goal,
  MacroTargets,
  MealEntry,
  PeriodNutritionSummary,
  PriceEntry,
  PriceCategory,
  Profile,
  Recipe,
  RecoveryPlan,
  Food,
  FoodRecommendation,
  NutritionFocus,
  ProteinAdherence,
  RecipeRecommendation,
  AlcoholImpact,
  StreakReward,
  WorkoutLog,
  WorkoutProgram,
  WorkoutSet,
} from "@/types";

export const ACTIVITY_METS: Record<ActivityState, number> = { lying: 1, sitting: 1.3, standing: 2, training: 6 };
export const GOAL_EXPECTED_WEEKLY_CHANGE: Record<Profile["goal"], number> = { gain: 0.25, maintain: 0, recomp: 0, cut: -0.5 };
export const GOAL_CALORIE_ADJUSTMENTS: Record<Goal, number> = { gain: 300, maintain: 0, recomp: 0, cut: -450 };

export const dateKey = (date = new Date()): string => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
export const daysAgoKey = (days: number): string => { const date = new Date(); date.setDate(date.getDate() - days); return dateKey(date); };
export const sumActivityHours = (profile: Profile): number => Object.values(profile.activityHours).reduce((total, hours) => total + hours, 0);
export const getActivityBreakdown = (profile: Profile): ActivityBreakdown => ({ ...profile.activityHours, total: sumActivityHours(profile) });
export const calculateBmr = (profile: Profile): number => 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + (profile.sex === "male" ? 5 : -161);
export const calculateActivityCalories = (profile: Profile): number => {
  const metHours = (Object.keys(ACTIVITY_METS) as ActivityState[]).reduce((total, state) => total + profile.activityHours[state] * ACTIVITY_METS[state], 0);
  return (calculateBmr(profile) / 24) * metHours;
};
export const calculateTargetCalories = (profile: Profile): number => Math.round(calculateActivityCalories(profile) + GOAL_CALORIE_ADJUSTMENTS[profile.goal] + profile.calorieAdjustment);
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
export const calculateRecoveryPlan = (excessCalories: number, weightKg: number, targetCalories: number): RecoveryPlan | null => {
  if (excessCalories <= 0 || weightKg <= 0) return null;
  const strictDays = Math.min(2, Math.max(1, Math.ceil(excessCalories / 500)));
  const softDays = Math.min(2, Math.max(1, Math.ceil(excessCalories / 250)));
  return {
    cardio: [
      { label: "Ходьба", met: 3.5, minutes: calculateCardioMinutes(excessCalories, weightKg, 3.5) },
      { label: "Велосипед", met: 7, minutes: calculateCardioMinutes(excessCalories, weightKg, 7) },
      { label: "Бег", met: 10, minutes: calculateCardioMinutes(excessCalories, weightKg, 10) },
    ],
    strict: { mode: "strict", days: strictDays, dailyDeficit: 500, targetCalories: Math.max(1200, targetCalories - 500), meal: "Фруктовый салат с греческим йогуртом", mealCalories: 280, mealProtein: 20 },
    soft: { mode: "soft", days: softDays, dailyDeficit: 250, targetCalories: Math.max(1200, targetCalories - 250), meal: "Фруктовый салат с творогом", mealCalories: 340, mealProtein: 24 },
  };
};
export const getFoodRecommendations = (foods: Food[], prices: PriceEntry[], targets: MacroTargets, category: PriceCategory, focus: NutritionFocus, limit = 6): FoodRecommendation[] => {
  const targetProteinRatio = targets.calories > 0 ? targets.protein * 4 / targets.calories : 0;
  const targetFatRatio = targets.calories > 0 ? targets.fat * 9 / targets.calories : 0;
  return foods.map((food) => {
    const priceCategory = getProductPriceCategory(prices, food.id) ?? "medium";
    const proteinRatio = food.calories > 0 ? food.protein * 4 / food.calories : 0;
    const fatRatio = food.calories > 0 ? food.fat * 9 / food.calories : 0;
    const proteinDensity = food.calories > 0 ? food.protein / food.calories : 0;
    const macroDistance = Math.abs(proteinRatio - targetProteinRatio) + Math.abs(fatRatio - targetFatRatio);
    const score = focus === "protein" ? proteinDensity * 100 + food.protein * 0.25 - macroDistance * 12 : focus === "light" ? Math.max(0, 80 - food.calories / 8) + proteinDensity * 35 - macroDistance * 8 : 100 - macroDistance * 35 + proteinDensity * 20;
    const reason = focus === "protein" ? `${food.protein.toFixed(1)} г белка на 100 ${food.unit}` : focus === "light" ? `${food.calories} ккал / 100 ${food.unit}, лёгкая база` : "ближе всего к балансу цели";
    return { food, priceCategory, score, reason };
  }).filter((item) => item.priceCategory === category).sort((a, b) => b.score - a.score).slice(0, limit);
};
export const getRecipeRecommendations = (recipes: Recipe[], selectedFoodIds: string[], targets: MacroTargets, focus: NutritionFocus, limit = 4): RecipeRecommendation[] => {
  const selected = new Set(selectedFoodIds);
  const targetProteinRatio = targets.calories > 0 ? targets.protein * 4 / targets.calories : 0;
  return recipes.map((recipe) => {
    const matchedFoodIds = recipe.foodIds.filter((foodId) => selected.has(foodId));
    const proteinRatio = recipe.calories > 0 ? recipe.protein * 4 / recipe.calories : 0;
    const macroDistance = Math.abs(proteinRatio - targetProteinRatio);
    const matchScore = selected.size ? matchedFoodIds.length / selected.size : 0.25;
    const focusScore = focus === "protein" ? recipe.protein * 0.8 : focus === "light" ? Math.max(0, 100 - recipe.calories / 8) : 80 - macroDistance * 20;
    const score = matchScore * 70 + focusScore - macroDistance * 8;
    const reason = matchedFoodIds.length ? `совпадает с ${matchedFoodIds.length} выбранным продуктом` : focus === "protein" ? "высокий белок" : "подходит под текущую цель";
    return { recipe, matchedFoodIds, score, reason };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
};
export const getAlcoholImpact = (alcoholCalories: number, targetCalories: number, targetProtein: number, consumedProtein: number, goal: Goal = "maintain"): AlcoholImpact => {
  const percentOfTarget = targetCalories > 0 ? alcoholCalories / targetCalories : 0;
  const progressEffect: AlcoholImpact["progressEffect"] = alcoholCalories <= 0 ? "none" : percentOfTarget >= 0.15 ? "risk" : "watch";
  const goalLabel = goal === "cut" ? "сушку" : goal === "gain" ? "набор" : goal === "recomp" ? "рекомпозицию" : "поддержание";
  const progressMessage = alcoholCalories <= 0
    ? "Алкоголь не учтён — на цель не влияет."
    : progressEffect === "risk"
      ? `Алкоголь занимает ${Math.round(percentOfTarget * 100)}% цели и может замедлить ${goalLabel}: калории уже получены, а белок не заменён.`
      : `Алкоголь занимает ${Math.round(percentOfTarget * 100)}% цели и сокращает запас для ${goalLabel}.`;
  return {
    percentOfTarget,
    remainingCalories: targetCalories - alcoholCalories,
    remainingProtein: targetProtein - consumedProtein,
    progressEffect,
    progressMessage,
  };
};
export const getProteinAdherence = (meals: MealEntry[], targetProtein: number, startDaysAgo: number, endDaysAgo = 0): ProteinAdherence => {
  const days = Array.from({ length: startDaysAgo - endDaysAgo + 1 }, (_, index) => daysAgoKey(startDaysAgo - index));
  const logged = days.map((date) => ({ date, totals: calculateDailyTotals(meals, [], date) })).filter((day) => day.totals.calories > 0);
  const compliantDays = logged.filter((day) => day.totals.protein >= targetProtein).length;
  const averageProtein = logged.length ? logged.reduce((total, day) => total + day.totals.protein, 0) / logged.length : 0;
  return { rate: logged.length ? compliantDays / logged.length : 0, loggedDays: logged.length, compliantDays, averageProtein };
};
export const getPeriodNutritionSummary = (meals: MealEntry[], alcohol: AlcoholEntry[], weights: AppState["weights"], targets: MacroTargets, startDaysAgo: number, endDaysAgo = 0): PeriodNutritionSummary => {
  const days = Array.from({ length: startDaysAgo - endDaysAgo + 1 }, (_, index) => daysAgoKey(startDaysAgo - index));
  const daySet = new Set(days);
  const logged = days.map((date) => calculateDailyTotals(meals, alcohol, date)).filter((totals) => totals.calories > 0);
  const weightSamples = weights.filter((entry) => daySet.has(entry.date));
  const protein = getProteinAdherence(meals, targets.protein, startDaysAgo, endDaysAgo);
  return {
    loggedDays: logged.length,
    averageCalories: logged.length ? logged.reduce((total, totals) => total + totals.calories, 0) / logged.length : null,
    averageProtein: logged.length ? logged.reduce((total, totals) => total + totals.protein, 0) / logged.length : null,
    averageWeight: weightSamples.length ? weightSamples.reduce((total, entry) => total + entry.weightKg, 0) / weightSamples.length : null,
    proteinCompliantDays: protein.compliantDays,
    proteinAdherence: protein.rate,
  };
};
export const getStreakReward = (streak: number, targets: MacroTargets, totals: DailyTotals): StreakReward | null => {
  const milestone = streak >= 14 ? 14 : streak >= 7 ? 7 : streak >= 3 ? 3 : null;
  if (!milestone) return null;
  const options: Record<StreakReward["milestone"], Omit<StreakReward, "milestone" | "portionFactor" | "calories" | "protein" | "fitsPlan" | "note">> = {
    3: { name: "Ягоды с греческим йогуртом", baseCalories: 220, baseProtein: 20 },
    7: { name: "Творог с ягодами и орехами", baseCalories: 300, baseProtein: 25 },
    14: { name: "Боул с курицей и рисом", baseCalories: 450, baseProtein: 40 },
  };
  const option = options[milestone];
  const remainingCalories = targets.calories - totals.calories;
  const remainingProtein = targets.protein - totals.protein;
  const portionFactor = remainingCalories > 0 && remainingProtein > 0 ? Math.min(1, remainingCalories / option.baseCalories, remainingProtein / option.baseProtein) : 0;
  const fitsPlan = portionFactor >= 0.5;
  return { ...option, milestone, portionFactor, calories: Math.round(option.baseCalories * portionFactor), protein: Math.round(option.baseProtein * portionFactor), fitsPlan, note: fitsPlan ? "порция вписывается в остаток дня" : "сегодня план заполнен — перенесите награду на следующий день" };
};
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
export const getAutoCorrection = (state: AppState, today = dateKey(), windowDays = 7): { active: boolean; suggestedAdjustment: number; observedWeeklyChange: number; expectedWeeklyChange: number; averageCalories: number } | null => {
  const safeWindowDays = Math.min(14, Math.max(7, windowDays));
  const start = new Date(`${today}T12:00:00`); start.setDate(start.getDate() - (safeWindowDays - 1));
  const startDate = start.toISOString().slice(0, 10);
  const days = Array.from({ length: safeWindowDays }, (_, index) => { const date = new Date(`${today}T12:00:00`); date.setDate(date.getDate() - index); return dateKey(date); });
  const meals = state.meals.filter((entry) => entry.date >= startDate && entry.date <= today);
  const alcohol = state.alcohol.filter((entry) => entry.date >= startDate && entry.date <= today);
  const loggedDays = new Set([...meals.map((entry) => entry.date), ...alcohol.map((entry) => entry.date)]).size;
  const weightStart = getSevenDayAverage(state.weights, startDate);
  const weightEnd = getSevenDayAverage(state.weights, today);
  if (loggedDays < safeWindowDays || weightStart === null || weightEnd === null) return null;
  const observedWeeklyChange = weightEnd - weightStart;
  const expectedWeeklyChange = GOAL_EXPECTED_WEEKLY_CHANGE[state.profile.goal];
  const discrepancy = observedWeeklyChange - expectedWeeklyChange;
  if (Math.abs(discrepancy) <= 0.25) return null;
  const averageCalories = days.reduce((total, date) => total + calculateDailyTotals(state.meals, state.alcohol, date).calories, 0) / safeWindowDays;
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
  const target = entries.find((entry) => entry.id === entryId);
  if (!target) return null;
  const matches = entries
    .filter((entry) => target.productId ? entry.productId === target.productId : entry.productName === target.productName)
    .map((entry) => ({ entry, price: getNormalizedPrice(entry) }))
    .sort((a, b) => a.price - b.price);
  if (!matches.length) return null;
  if (matches.length === 1) return "medium";
  const position = matches.findIndex(({ entry }) => entry.id === entryId) / (matches.length - 1);
  return position <= 0.33 ? "budget" : position >= 0.67 ? "premium" : "medium";
};
export const getProductPriceCategory = (entries: PriceEntry[], productId?: string): PriceCategory | null => {
  if (!productId) return null;
  const cheapestByProduct = new Map<string, number>();
  entries.filter((entry) => entry.productId).forEach((entry) => {
    const price = getNormalizedPrice(entry);
    const current = cheapestByProduct.get(entry.productId!);
    if (current === undefined || price < current) cheapestByProduct.set(entry.productId!, price);
  });
  const productPrices = [...cheapestByProduct].map(([id, price]) => ({ id, price })).sort((a, b) => a.price - b.price);
  if (!productPrices.some(({ id }) => id === productId)) return null;
  if (productPrices.length === 1) return "medium";
  const position = productPrices.findIndex(({ id }) => id === productId) / (productPrices.length - 1);
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
    else if (program.type === "custom" && program.mode === "hypertrophy") { const target = Number(exercise.reps.split("–").at(-1) ?? "8"); nextWeight = sets.length > 0 && sets.every((set) => set.reps >= target) ? currentWeight + 2.5 : currentWeight; }
    else if (program.type === "custom") nextWeight = sets.length > 0 && (sets.at(-1)?.rpe ?? 10) <= 8 ? currentWeight + 2.5 : currentWeight;
    else nextWeight = Math.max(currentWeight + 2.5, (program.trainingMaxes?.[exercise.name] ?? currentWeight) * 0.9);
    result[exercise.name] = Math.round(nextWeight * 2) / 2;
    return result;
  }, {});
};
