import { createDemoState } from "@/data/demo";
import type { AppState } from "@/types";

export const STORAGE_KEY = "forma-state-v1";

const isAppState = (value: unknown): value is AppState => {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<AppState>;
  return typeof state.version === "number" && Boolean(state.profile) && Array.isArray(state.meals) && Array.isArray(state.weights) && Array.isArray(state.programs);
};

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDemoState();
    const parsed = JSON.parse(raw) as unknown;
    return isAppState(parsed) && parsed.version === 1 ? parsed : createDemoState();
  } catch {
    return createDemoState();
  }
};

export const saveState = (state: AppState): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* local storage unavailable */ }
};

export const importState = (raw: string): AppState => {
  let parsed: { state?: unknown };
  try {
    parsed = JSON.parse(raw) as { state?: unknown };
  } catch {
    throw new Error("Не удалось прочитать файл данных: это не корректный JSON");
  }
  if (!isAppState(parsed?.state)) throw new Error("Не удалось прочитать файл данных: неизвестный формат резервной копии");
  return parsed.state;
};
