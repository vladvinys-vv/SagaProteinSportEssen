export type FitnessGoal = "cut" | "maintain" | "gain" | "recomp";

export type Sex = "male" | "female";

export type FitnessTab = "nutrition" | "training" | "progress" | "profile";

export interface Profile {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  goal: FitnessGoal;
  createdAt: string;
  activityAdjustmentKcal?: number;
}

export interface DailyActivity {
  lyingHours: number;
  sittingHours: number;
  standingHours: number;
  trainingHours: number;
  steps?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  servingG: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  isJunk?: boolean;
  source: "catalog" | "custom";
  pricePerServing?: number;
}

export interface FoodEntry {
  id: string;
  date: string;
  foodId: string;
  quantity: number;
  meal: string;
}

export interface AlcoholEntry {
  id: string;
  date: string;
  name: string;
  volumeMl: number;
  abv: number;
}

export interface WeightEntry {
  date: string;
  weightKg: number;
}

export interface ExerciseTemplate {
  name: string;
  sets: number;
  reps: string;
  note?: string;
}

export interface WorkoutDayTemplate {
  name: string;
  exercises: ExerciseTemplate[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  days: WorkoutDayTemplate[];
}

export interface LoggedSet {
  reps: number;
  weightKg: number;
}

export interface LoggedExercise {
  name: string;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  templateId: string;
  dayName: string;
  exercises: LoggedExercise[];
}

export interface MealPreset {
  id: string;
  name: string;
  entries: Omit<FoodEntry, "id" | "date">[];
}

export interface FitnessState {
  profile?: Profile;
  activityByDate: Record<string, DailyActivity>;
  foodEntries: FoodEntry[];
  alcoholEntries: AlcoholEntry[];
  weightEntries: WeightEntry[];
  customFoods: FoodItem[];
  mealPresets: MealPreset[];
  workoutLogs: WorkoutLog[];
  jokerStreak: number;
  lastGoodDate?: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  alcoholCalories: number;
}

export interface DailySummary {
  targetCalories: number;
  bmr: number;
  activityCalories: number;
  totals: DailyTotals;
  remaining: DailyTotals;
  balance: number;
  status: "deficit" | "maintenance" | "surplus";
  proteinPerKg: number;
}

export interface StoredBackup {
  version: 1;
  exportedAt: string;
  state: FitnessState;
}
