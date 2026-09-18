export type Sex = "female" | "male";
export type Goal = "gain" | "maintain" | "recomp" | "cut";
export type ActivityState = "lying" | "sitting" | "standing" | "training";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type Currency = "RUB" | "USD" | "EUR";
export type NutritionSource = "database" | "barcode" | "custom" | "preset";
export type ProgramType = "fiveThreeOne" | "juggernaut" | "ppl" | "startingStrength" | "custom";
export type ProgramMode = "strength" | "hypertrophy" | "general";
export type AlcoholProgressStatus = "none" | "watch" | "risk";
export type PriceCategory = "budget" | "medium" | "premium";
export type NutritionFocus = "protein" | "balanced" | "light";

export interface Profile {
  completed: boolean;
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  goal: Goal;
  currency: Currency;
  calorieAdjustment: number;
  proteinGPerKg: number;
  fatGPerKg: number;
  sugarLimitG: number;
  activityHours: Record<ActivityState, number>;
  steps: number;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  barcode?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  unit: "g" | "ml";
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
  source: NutritionSource;
  junkFood: boolean;
  barcode?: string;
}

export interface PresetEntry {
  foodId?: string;
  name: string;
  amountG: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  source: NutritionSource;
  junkFood: boolean;
  barcode?: string;
}

export interface MealPreset {
  id: string;
  name: string;
  meal: MealType;
  entries: PresetEntry[];
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
  trainingMaxes?: Record<string, number>;
  notes: string;
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

export interface AdjustmentHistory {
  date: string;
  previousTarget: number;
  newTarget: number;
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
  adjustments: AdjustmentHistory[];
}

export interface DailyTotals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  alcoholCalories: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
}

export interface CardioOption {
  label: string;
  met: number;
  minutes: number;
}

export interface DeficitPlanOption {
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
  strict: DeficitPlanOption;
  soft: DeficitPlanOption;
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
  progressEffect: AlcoholProgressStatus;
  progressMessage: string;
}

export interface StreakReward {
  milestone: 3 | 7 | 14;
  name: string;
  baseCalories: number;
  baseProtein: number;
  portionFactor: number;
  calories: number;
  protein: number;
  fitsPlan: boolean;
  note: string;
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

export interface ActivityBreakdown {
  lying: number;
  sitting: number;
  standing: number;
  training: number;
  total: number;
}
