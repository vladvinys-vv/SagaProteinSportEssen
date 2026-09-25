import { beforeEach, describe, expect, it } from "vitest";
import { createDemoState, createEmptyState } from "@/data/demo";
import { importState, loadState, STORAGE_KEY, saveState } from "@/lib/storage";

describe("локальное хранилище", () => {
  beforeEach(() => window.localStorage.clear());

  it("без сохранённых данных отдаёт демо-состояние", () => {
    const state = loadState();
    expect(state.version).toBe(1);
    expect(state.meals.length).toBeGreaterThan(0);
    expect(state.profile.weightKg).toBe(createDemoState().profile.weightKg);
  });

  it("сохраняет и читает состояние", () => {
    const base = createEmptyState();
    saveState({ ...base, profile: { ...base.profile, steps: 12345 } });
    expect(loadState().profile.steps).toBe(12345);
  });

  it("игнорирует повреждённый JSON и чужую версию схемы", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ это не json");
    expect(loadState().meals.length).toBeGreaterThan(0);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, profile: {}, meals: [] }));
    expect(loadState().profile.weightKg).toBe(createDemoState().profile.weightKg);
  });

  it("импортирует резервную копию и отклоняет мусор", () => {
    const base = createEmptyState();
    const imported = importState(JSON.stringify({ state: base }));
    expect(imported.profile.heightCm).toBe(base.profile.heightCm);
    expect(imported.meals).toEqual([]);

    expect(() => importState(JSON.stringify({ state: { version: 1 } }))).toThrow();
    expect(() => importState("null")).toThrow();
  });
});
