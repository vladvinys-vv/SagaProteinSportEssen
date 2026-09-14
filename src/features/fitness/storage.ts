import type { FitnessState, StoredBackup } from "./types";

export const STORAGE_KEY = "personal-fitness-state-v1";

const emptyState = (): FitnessState => ({
  activityByDate: {},
  foodEntries: [],
  alcoholEntries: [],
  weightEntries: [],
  customFoods: [],
  mealPresets: [],
  workoutLogs: [],
  jokerStreak: 0,
});

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export const loadState = (): FitnessState => {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<FitnessState>;
    return {
      ...emptyState(),
      ...parsed,
      activityByDate: isRecord(parsed.activityByDate) ? parsed.activityByDate : {},
      foodEntries: Array.isArray(parsed.foodEntries) ? parsed.foodEntries : [],
      alcoholEntries: Array.isArray(parsed.alcoholEntries) ? parsed.alcoholEntries : [],
      weightEntries: Array.isArray(parsed.weightEntries) ? parsed.weightEntries : [],
      customFoods: Array.isArray(parsed.customFoods) ? parsed.customFoods : [],
      mealPresets: Array.isArray(parsed.mealPresets) ? parsed.mealPresets : [],
      workoutLogs: Array.isArray(parsed.workoutLogs) ? parsed.workoutLogs : [],
    };
  } catch {
    return emptyState();
  }
};

export const saveState = (state: FitnessState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const exportState = (state: FitnessState): string => {
  const backup: StoredBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    state,
  };
  return JSON.stringify(backup, null, 2);
};

export const importState = (raw: string): FitnessState => {
  const parsed = JSON.parse(raw) as StoredBackup | FitnessState;
  const state = "state" in parsed ? parsed.state : parsed;
  if (!isRecord(state)) throw new Error("Неверный формат резервной копии");
  return {
    ...emptyState(),
    ...state,
    activityByDate: isRecord(state.activityByDate) ? state.activityByDate : {},
    foodEntries: Array.isArray(state.foodEntries) ? state.foodEntries : [],
    alcoholEntries: Array.isArray(state.alcoholEntries) ? state.alcoholEntries : [],
    weightEntries: Array.isArray(state.weightEntries) ? state.weightEntries : [],
    customFoods: Array.isArray(state.customFoods) ? state.customFoods : [],
    mealPresets: Array.isArray(state.mealPresets) ? state.mealPresets : [],
    workoutLogs: Array.isArray(state.workoutLogs) ? state.workoutLogs : [],
  };
};

export const resetState = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};
