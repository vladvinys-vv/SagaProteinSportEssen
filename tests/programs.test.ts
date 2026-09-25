import { describe, expect, it } from "vitest";
import type { ProgramBuilderInput } from "@/lib/programs";
import { buildFiveThreeOne, buildJuggernaut, getDefaultLifts, roundToStep } from "@/lib/programs";

const baseInput: ProgramBuilderInput = {
  lifts: [
    { name: "Присед", maxKg: 140 },
    { name: "Жим лёжа", maxKg: 100 },
  ],
  trainingMaxPercent: 90,
  accessory: "none",
  mode: "strength",
};

describe("конструктор программ", () => {
  it("округляет рабочий вес до 2.5 кг", () => {
    expect(roundToStep(126.34)).toBe(127.5);
    expect(roundToStep(126.1)).toBe(125);
    expect(roundToStep(127.5)).toBe(127.5);
    expect(roundToStep(-10)).toBe(0);
  });

  it("берёт тренировочный максимум от 1ПМ и считает проценты 5/3/1", () => {
    const program = buildFiveThreeOne(baseInput);
    expect(program.type).toBe("fiveThreeOne");
    expect(program.trainingMaxes).toEqual({ Присед: 125, "Жим лёжа": 90 });
    expect(program.days.map((day) => day.name)).toEqual(["Присед", "Жим лёжа"]);

    const squat = program.days[0]!;
    const week1 = squat.exercises[0]!;
    expect(week1.name).toBe("Неделя 1 · 5");
    expect(week1.setsPlan).toHaveLength(3);
    // 125 × 65 % = 81.25 → 82.5, 125 × 75 % = 93.75 → 95, 125 × 85 % = 106.25 → 107.5
    expect(week1.setsPlan?.map((set) => set.weightKg)).toEqual([82.5, 95, 107.5]);
    expect(week1.setsPlan?.at(-1)?.amrap).toBe(true);

    const deload = squat.exercises.at(-1)!;
    expect(deload.name).toContain("разгрузка");
    expect(deload.setsPlan?.every((set) => set.amrap === undefined)).toBe(true);
    expect(deload.setsPlan?.map((set) => set.weightKg)).toEqual([50, 62.5, 75]);
    expect(deload.setsPlan?.[2]?.percent).toBe(60);
  });

  it("добавляет подсобку FSL и BBB в 5/3/1", () => {
    const fsl = buildFiveThreeOne({ ...baseInput, accessory: "fsl" });
    const fslAccessory = fsl.days[0]!.exercises.at(-1)!;
    expect(fslAccessory.name).toBe("Присед · FSL");
    expect(fslAccessory.setsPlan).toHaveLength(4);
    expect(fslAccessory.setsPlan?.[0]).toMatchObject({ percent: 65, reps: 5, weightKg: 82.5 });

    const bbb = buildFiveThreeOne({ ...baseInput, accessory: "bbb" });
    const bbbAccessory = bbb.days[0]!.exercises.at(-1)!;
    expect(bbbAccessory.name).toBe("Присед · BBB");
    expect(bbbAccessory.sets).toBe(5);
    expect(bbbAccessory.setsPlan?.every((set) => set.reps === 10)).toBe(true);
    expect(bbbAccessory.setsPlan?.[0]?.weightKg).toBe(62.5);
  });

  it("строит волны Juggernaut с разгрузочной неделей", () => {
    const program = buildJuggernaut({ ...baseInput, mode: "hypertrophy" });
    expect(program.type).toBe("juggernaut");
    expect(program.mode).toBe("hypertrophy");

    const press = program.days[1]!;
    expect(press.exercises.map((exercise) => exercise.name)).toEqual([
      "10-повторная волна",
      "8-повторная волна",
      "5-повторная волна",
      "3-повторная волна",
    ]);

    const wave = press.exercises[0]!;
    // ТМ жима лёжа = 90 кг: 60 % → 55, 65 % → 57.5, 70 % → 62.5, разгрузка 40 % → 35
    expect(wave.setsPlan?.map((set) => set.weightKg)).toEqual([55, 57.5, 62.5, 35]);
    expect(wave.setsPlan?.map((set) => set.reps)).toEqual([10, 10, 10, 10]);
    expect(wave.setsPlan?.[2]?.amrap).toBe(true);
    expect(wave.setsPlan?.[3]?.label).toBe("Разгрузка");
    expect(wave.note).toContain("60/65/70");
  });

  it("отбрасывает движения без максимума и подставляет значения по умолчанию", () => {
    const program = buildJuggernaut({
      ...baseInput,
      lifts: [...baseInput.lifts, { name: "Тяга в наклоне", maxKg: 0 }, { name: "  ", maxKg: 100 }],
    });
    expect(program.days).toHaveLength(2);
    expect(getDefaultLifts().map((lift) => lift.name)).toEqual(["Присед", "Жим лёжа", "Становая тяга", "Жим стоя"]);
    expect(getDefaultLifts({ Присед: 120 })[0]!.maxKg).toBe(120);
  });

  it("учитывает изменённый процент тренировочного максимума", () => {
    const conservative = buildFiveThreeOne({ ...baseInput, trainingMaxPercent: 85 });
    expect(conservative.trainingMaxes?.Присед).toBe(120);
    expect(conservative.days[0]!.exercises[0]!.setsPlan?.[0]?.weightKg).toBe(77.5);
  });
});
