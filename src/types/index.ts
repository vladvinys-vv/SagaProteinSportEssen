/**
 * Доменные типы приложения «Форма».
 *
 * Приложение полностью локальное: всё состояние хранится в браузере и
 * описывается типом {@link AppState}. Версия схемы — `AppState.version`.
 */

/** Биологический пол — влияет на расчёт базового метаболизма. */
export type Sex = "female" | "male";

/** Цель по составу тела. */
export type Goal = "gain" | "maintain" | "recomp" | "cut";

/** Состояние активности в течение суток (используется для MET-расчёта). */
export type ActivityState = "lying" | "sitting" | "standing" | "training";

/** Приём пищи, к которому относится запись. */
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/** Валюта для учёта цен на продукты. */
export type Currency = "RUB" | "USD" | "EUR";

/** Откуда пришла запись о питании. */
export type NutritionSource = "database" | "barcode" | "custom" | "preset";

/** Шаблон тренировочной программы. */
export type ProgramType = "fiveThreeOne" | "juggernaut" | "ppl" | "startingStrength" | "custom";

/** Режим пользовательской программы — влияет на автопрогрессию. */
export type ProgramMode = "strength" | "hypertrophy" | "general";

/** Оценка влияния алкоголя на дневную цель. */
export type AlcoholProgressStatus = "none" | "watch" | "risk";

/** Ценовая категория продукта относительно других магазинов. */
export type PriceCategory = "budget" | "medium" | "premium";

/** Фокус подбора рекомендаций. */
export type NutritionFocus = "protein" | "balanced" | "light";

/** Профиль пользователя — основа всех расчётов нормы и макросов. */
export interface Profile {
  /** Прошёл ли пользователь обязательный онбординг. */
  completed: boolean;
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  goal: Goal;
  currency: Currency;
  /** Ручная коррекция нормы калорий, ккал. */
  calorieAdjustment: number;
  proteinGPerKg: number;
  fatGPerKg: number;
  sugarLimitG: number;
  /** Распределение 24 часов по состояниям активности. */
  activityHours: Record<ActivityState, number>;
  steps: number;
}

/** Продукт из встроенной базы или созданный пользователем. */
export interface Food {
  id: string;
  name: string;
  category: string;
  barcode?: string;
  /** КБЖУ на 100 г (или 100 мл) продукта. */
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  unit: "g" | "ml";
  /** Десерт: участвует в подборе вкусняшек по серии чистых дней. */
  treat?: boolean;
}

/** Запись о съеденном продукте за конкретный день. */
export interface MealEntry {
  id: string;
  /** Дата в формате YYYY-MM-DD. */
  date: string;
  meal: MealType;
  foodId?: string;
  name: string;
  amountG: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  source: NutritionSource;
  /** Отмечено ли пользователем как джанк-фуд (влияет на серию чистых дней). */
  junkFood: boolean;
  barcode?: string;
}

/** Снимок записи о питании для пресета (без id, даты и приёма пищи). */
export type PresetEntry = Omit<MealEntry, "id" | "date" | "meal">;

/** Сохранённый набор продуктов для быстрого добавления приёма пищи. */
export interface MealPreset {
  id: string;
  name: string;
  meal: MealType;
  entries: PresetEntry[];
}

/** Учёт алкоголя: калории считаются отдельно от макросов еды. */
export interface AlcoholEntry {
  id: string;
  date: string;
  name: string;
  volumeMl: number;
  abv: number;
  calories: number;
}

/** Замер веса. */
export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
}

/** Наблюдение за ценой продукта в магазине. */
export interface PriceEntry {
  id: string;
  /** Ссылка на продукт базы, если название совпало. */
  productId?: string;
  productName: string;
  store: string;
  city: string;
  currency: Currency;
  packagePrice: number;
  packageSizeG?: number;
  packageSizeMl?: number;
  date: string;
}

/** Готовый рецепт с макросами на порцию. */
export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  /** Продукты рецепта из базы — используются в рекомендациях. */
  foodIds: string[];
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  instructions: string[];
  tags: string[];
}

/** Подход, рассчитанный по проценту от тренировочного максимума. */
export interface PlannedSet {
  /** Процент от тренировочного максимума. */
  percent: number;
  reps: number;
  /** Рабочий вес с округлением до шага (2.5 кг). */
  weightKg: number;
  /** Подход «до отказа» (+) в схемах 5/3/1 и Juggernaut. */
  amrap?: boolean;
  /** Подпись недели цикла: «Неделя 1», «Разгрузка». */
  label: string;
}

/** Упражнение внутри тренировочного дня. */
export interface ExerciseTemplate {
  name: string;
  sets: number;
  /** Повторы в виде строки, допускаются диапазоны («8–12», «5/3/1»). */
  reps: string;
  note?: string;
  /** План подходов, если программа построена калькулятором (5/3/1, Juggernaut). */
  setsPlan?: PlannedSet[];
  /** Тренировочный максимум, от которого считались проценты. */
  percentBaseKg?: number;
}

/** Тренировочный день программы. */
export interface WorkoutDay {
  id: string;
  name: string;
  exercises: ExerciseTemplate[];
}

/** Тренировочная программа (встроенная или пользовательская). */
export interface WorkoutProgram {
  id: string;
  name: string;
  type: ProgramType;
  mode?: ProgramMode;
  days: WorkoutDay[];
  /** Рабочие максимумы для процентных схем. */
  trainingMaxes?: Record<string, number>;
  notes: string;
}

/** Записанный подход. */
export interface WorkoutSet {
  id: string;
  exercise: string;
  weightKg: number;
  reps: number;
  rpe?: number;
}

/** Сохранённая тренировка. */
export interface WorkoutLog {
  id: string;
  date: string;
  programId: string;
  programName: string;
  sets: WorkoutSet[];
}

/** История применённых автокоррекций нормы калорий. */
export interface AdjustmentHistory {
  date: string;
  previousTarget: number;
  newTarget: number;
  reason: string;
}

/** Полное состояние приложения (то, что лежит в localStorage). */
export interface AppState {
  version: number;
  profile: Profile;
  /** Встроенная база продуктов. */
  foods: Food[];
  customFoods: Food[];
  meals: MealEntry[];
  presets: MealPreset[];
  alcohol: AlcoholEntry[];
  weights: WeightEntry[];
  prices: PriceEntry[];
  recipes: Recipe[];
  programs: WorkoutProgram[];
  workoutLogs: WorkoutLog[];
  adjustments: AdjustmentHistory[];
}

/** Суммарные показатели дня. */
export interface DailyTotals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  alcoholCalories: number;
}

/** Целевые показатели на день. */
export interface MacroTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
}

/** Вариант кардио-компенсации перебора калорий. */
export interface CardioOption {
  label: string;
  met: number;
  minutes: number;
}

/** План мягкого или строгого дефицита. */
export interface DeficitPlanOption {
  mode: "strict" | "soft";
  days: number;
  dailyDeficit: number;
  targetCalories: number;
  meal: string;
  mealCalories: number;
  mealProtein: number;
}

/** План возврата дня к цели после перебора. */
export interface RecoveryPlan {
  cardio: CardioOption[];
  strict: DeficitPlanOption;
  soft: DeficitPlanOption;
}

/** Рекомендованный продукт под текущую цель. */
export interface FoodRecommendation {
  food: Food;
  priceCategory: PriceCategory;
  score: number;
  reason: string;
}

/** Рекомендованный рецепт под текущую цель и выбранные продукты. */
export interface RecipeRecommendation {
  recipe: Recipe;
  matchedFoodIds: string[];
  score: number;
  reason: string;
}

/** Влияние алкоголя на дневной план. */
export interface AlcoholImpact {
  percentOfTarget: number;
  remainingCalories: number;
  remainingProtein: number;
  progressEffect: AlcoholProgressStatus;
  progressMessage: string;
}

/** Награда за серию дней без джанк-фуда. */
export interface StreakReward {
  milestone: 3 | 7 | 14;
  name: string;
  baseCalories: number;
  baseProtein: number;
  /** Доля порции, которая вписывается в остаток дня (0…1). */
  portionFactor: number;
  calories: number;
  protein: number;
  fitsPlan: boolean;
  note: string;
}

/** Соблюдение цели по белку за период. */
export interface ProteinAdherence {
  rate: number;
  loggedDays: number;
  compliantDays: number;
  averageProtein: number;
}

/** Сводка питания за период. */
export interface PeriodNutritionSummary {
  loggedDays: number;
  averageCalories: number | null;
  averageProtein: number | null;
  averageWeight: number | null;
  proteinCompliantDays: number;
  proteinAdherence: number;
}

/** Насколько алкоголь тормозит прогресс. */
export interface AlcoholStagnation {
  /** Длина окна анализа, дней. */
  days: number;
  /** Количество стандартных доз (10 г этанола). */
  standardDrinks: number;
  totalCalories: number;
  drinksPerWeek: number;
  /** Эквивалент в граммах жира (7700 ккал = 1 кг). */
  fatEquivalentG: number;
  /** Сколько дней прогресса «съел» алкоголь. */
  delayedDays: number;
  /** Плановая дневная коррекция, к которой сравниваем. */
  dailyBudget: number;
  status: AlcoholProgressStatus;
  goalLabel: string;
  message: string;
}

/** Ступень лестницы вкусняшек за серию чистых дней. */
export interface TreatTier {
  day: number;
  name: string;
  budgetCalories: number;
  budgetProtein: number;
  label: string;
}

/** Десерт, подобранный под остаток дня. */
export interface TreatSuggestion {
  food: Food;
  portionG: number;
  calories: number;
  protein: number;
  /** Вписывается ли порция в остаток калорий. */
  fits: boolean;
  reason: string;
}

/** Предложение магазина по конкретному продукту. */
export interface StoreOffer {
  entryId: string;
  store: string;
  city: string;
  currency: Currency;
  /** Цена за упаковку. */
  price: number;
  /** Приведённая цена за 100 г/мл. */
  normalizedPrice: number;
  packageSize?: number;
  date: string;
}

/** Сравнение цен на продукт между магазинами. */
export interface ProductPriceComparison {
  key: string;
  productName: string;
  unit: "г" | "мл";
  offers: StoreOffer[];
  cheapest: StoreOffer;
  priciest: StoreOffer;
  average: number;
  /** Насколько дороже самая высокая цена к самой низкой, %. */
  spreadPercent: number;
  /** Экономия на упаковке при покупке в дешёвом магазине. */
  savings: number;
}

/** Рейтинг магазина по ценам. */
export interface StoreRanking {
  store: string;
  city: string;
  /** Сколько раз магазин был самым дешёвым. */
  wins: number;
  entries: number;
  /** Средний индекс цены к лучшей среди товаров магазина, %. */
  averageIndex: number;
}

/** Разбивка суток по состояниям активности. */
export interface ActivityBreakdown {
  lying: number;
  sitting: number;
  standing: number;
  training: number;
  total: number;
}

/** Признак плато по динамике веса. */
export interface PlateauResult {
  active: boolean;
  weeklyChange: number;
  adherence: number;
}

/** Предложение автоматической коррекции нормы. */
export interface AutoCorrection {
  active: boolean;
  suggestedAdjustment: number;
  observedWeeklyChange: number;
  expectedWeeklyChange: number;
  averageCalories: number;
}
