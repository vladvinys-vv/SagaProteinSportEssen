export type ActivityState = "lying" | "sitting" | "standing" | "training";

export type Goal = "gain" | "maintain" | "recomp" | "cut";

export type Currency = "RUB" | "USD" | "EUR";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealSource = "database" | "custom" | "barcode" | "preset";

export type PriceCategory = "budget" | "medium" | "premium";

export type NutritionFocus = "protein" | "balanced" | "light";

export type ProgramMode = "strength" | "hypertrophy" | "general";

export type ProgramType = "fiveThreeOne" | "juggernaut" | "ppl" | "startingStrength" | "custom";

export interface ActivityHours extends Record<ActivityState, number> {
  lying: number;
  sitting: number;
  standing: number;
  training: number;
}

export interface ActivityBreakdown extends ActivityHours {
  total: number;
}

export interface Profile {
  completed: boolean;
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  goal: Goal;
  currency: Currency;
  calorieAdjustment: number;
  proteinGPerKg: number;
  fatGPerKg: number;
  sugarLimitG: number;
  activityHours: ActivityHours;
  steps: number;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  unit: "g" | "ml";
  barcode?: string;
}

export interface MealEntry {
  id: string;
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
  source: MealSource;
  junkFood: boolean;
  barcode?: string;
}

export interface MealPresetEntry {
  foodId?: string;
  name: string;
  amountG: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  source: MealSource;
  junkFood: boolean;
  barcode?: string;
}

export interface MealPreset {
  id: string;
  name: string;
  meal: MealType;
  entries: MealPresetEntry[];
}

export interface AlcoholEntry {
  id: string;
  date: string;
  name: string;
  volumeMl: number;
  abv: number;
  calories: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
}

export interface PriceEntry {
  id: string;
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

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  foodIds: string[];
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  instructions: string[];
  tags: string[];
}

export interface ExerciseTemplate {
  name: string;
  sets: number;
  reps: string;
  note?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: ExerciseTemplate[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  type: ProgramType;
  mode?: ProgramMode;
  days: WorkoutDay[];
  notes?: string;
  trainingMaxes?: Record<string, number>;
}

export interface WorkoutSet {
  id: string;
  exercise: string;
  weightKg: number;
  reps: number;
  rpe?: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  programId: string;
  programName: string;
  sets: WorkoutSet[];
}

export interface StateAdjustment {
  id: string;
  date: string;
  amountKcal: number;
  reason: string;
}

export interface AppState {
  version: number;
  profile: Profile;
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
  adjustments: StateAdjustment[];
}

export interface MacroTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  alcoholCalories: number;
}

export interface CardioOption {
  label: string;
  met: number;
  minutes: number;
}

export interface RecoveryPlanMode {
  mode: "strict" | "soft";
  days: number;
  dailyDeficit: number;
  targetCalories: number;
  meal: string;
  mealCalories: number;
  mealProtein: number;
}

export interface RecoveryPlan {
  cardio: CardioOption[];
  strict: RecoveryPlanMode;
  soft: RecoveryPlanMode;
}

export interface FoodRecommendation {
  food: Food;
  priceCategory: PriceCategory;
  score: number;
  reason: string;
}

export interface RecipeRecommendation {
  recipe: Recipe;
  matchedFoodIds: string[];
  score: number;
  reason: string;
}

export interface AlcoholImpact {
  percentOfTarget: number;
  remainingCalories: number;
  remainingProtein: number;
  progressEffect: "none" | "watch" | "risk";
  progressMessage: string;
}

export interface ProteinAdherence {
  rate: number;
  loggedDays: number;
  compliantDays: number;
  averageProtein: number;
}

export interface PeriodNutritionSummary {
  loggedDays: number;
  averageCalories: number | null;
  averageProtein: number | null;
  averageWeight: number | null;
  proteinCompliantDays: number;
  proteinAdherence: number;
}

export interface StreakReward {
  name: string;
  baseCalories: number;
  baseProtein: number;
  milestone: 3 | 7 | 14;
  portionFactor: number;
  calories: number;
  protein: number;
  fitsPlan: boolean;
  note: string;
}
