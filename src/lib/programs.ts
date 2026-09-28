import type { ExerciseTemplate, PlannedSet, ProgramMode, WorkoutDay, WorkoutProgram } from "@/types";

/** Шаг округления рабочего веса, кг. */
export const PROGRAM_WEIGHT_STEP_KG = 2.5;

/** Базовый список главных движений для 5/3/1 и Juggernaut. */
export const DEFAULT_LIFT_NAMES = ["Присед", "Жим лёжа", "Становая тяга", "Жим стоя"];

/** Округление веса до ближайшего шага (по умолчанию 2.5 кг). */
export const roundToStep = (weightKg: number, step = PROGRAM_WEIGHT_STEP_KG): number =>
  Math.max(0, Math.round(weightKg / step) * step);

export interface ProgramLiftInput {
  name: string;
  /** Текущий максимум (1ПМ), от него считается тренировочный максимум. */
  maxKg: number;
}

export type ProgramAccessory = "none" | "fsl" | "bbb";

export interface ProgramBuilderInput {
  lifts: ProgramLiftInput[];
  /** Доля от максимума, которая становится тренировочным максимумом (85–90 %). */
  trainingMaxPercent: number;
  accessory: ProgramAccessory;
  mode: ProgramMode;
  name?: string;
}

const weeklyBlock = (label: string, sets: { percent: number; reps: number; amrap?: boolean }[]) => ({ label, sets });

/** Классические волны 5/3/1: 5 → 3 → 5/3/1 → разгрузка. */
export const FIVE_THREE_ONE_BLOCKS = [
  weeklyBlock("Неделя 1 · 5", [{ percent: 65, reps: 5 }, { percent: 75, reps: 5 }, { percent: 85, reps: 5, amrap: true }]),
  weeklyBlock("Неделя 2 · 3", [{ percent: 70, reps: 3 }, { percent: 80, reps: 3 }, { percent: 90, reps: 3, amrap: true }]),
  weeklyBlock("Неделя 3 · 5/3/1", [{ percent: 75, reps: 5 }, { percent: 85, reps: 3 }, { percent: 95, reps: 1, amrap: true }]),
  weeklyBlock("Неделя 4 · разгрузка", [{ percent: 40, reps: 5 }, { percent: 50, reps: 5 }, { percent: 60, reps: 5 }]),
];

interface JuggernautWave {
  name: string;
  reps: number;
  /** Проценты первых трёх недель волны; последняя неделя — до отказа. */
  percents: [number, number, number];
  deloadPercent: number;
}

/** Волны Juggernaut: 10 → 8 → 5 → 3 повтора с разгрузочной неделей. */
export const JUGGERNAUT_WAVES: JuggernautWave[] = [
  { name: "10-повторная волна", reps: 10, percents: [60, 65, 70], deloadPercent: 40 },
  { name: "8-повторная волна", reps: 8, percents: [65, 70, 75], deloadPercent: 45 },
  { name: "5-повторная волна", reps: 5, percents: [70, 75, 80], deloadPercent: 50 },
  { name: "3-повторная волна", reps: 3, percents: [75, 80, 85], deloadPercent: 55 },
];

const plannedSet = (trainingMaxKg: number, percent: number, reps: number, label: string, amrap = false): PlannedSet => ({
  percent,
  reps,
  weightKg: roundToStep((trainingMaxKg * percent) / 100),
  amrap: amrap || undefined,
  label,
});

interface AccessoryBlock {
  label: string;
  /** Процент первого рабочего подхода недели (для FSL). */
  percent: number;
  isDeload?: boolean;
}

const accessoryExercise = (
  liftName: string,
  trainingMaxKg: number,
  blocks: AccessoryBlock[],
  accessory: ProgramAccessory,
): ExerciseTemplate | null => {
  if (accessory === "none") return null;
  const isBbb = accessory === "bbb";
  // BBB всегда 5×10 от 50 % максимума, на разгрузочной неделе — 40 %.
  const percentFor = (block: AccessoryBlock) => (isBbb ? (block.isDeload ? 40 : 50) : block.percent);
  return {
    name: `${liftName} · ${isBbb ? "BBB" : "FSL"}`,
    sets: 5,
    reps: isBbb ? "10" : "5",
    note: isBbb ? "Boring But Big: 5 подходов по 10 повторов" : "First Set Last: 5 подходов по 5 повторов",
    percentBaseKg: trainingMaxKg,
    setsPlan: blocks.map((block) => {
      const percent = percentFor(block);
      return {
        percent,
        reps: isBbb ? 10 : 5,
        weightKg: roundToStep((trainingMaxKg * percent) / 100),
        label: block.label,
      };
    }),
  };
};

const buildDays = (
  input: ProgramBuilderInput,
  exerciseBuilder: (lift: ProgramLiftInput, trainingMaxKg: number) => ExerciseTemplate[],
  accessoryBlocks: (lift: ProgramLiftInput) => AccessoryBlock[],
): WorkoutDay[] =>
  input.lifts
    .filter((lift) => lift.name.trim() && lift.maxKg > 0)
    .map((lift) => {
      const trainingMaxKg = roundToStep((lift.maxKg * input.trainingMaxPercent) / 100);
      const accessory = accessoryExercise(lift.name, trainingMaxKg, accessoryBlocks(lift), input.accessory);
      return {
        id: `gen-${lift.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: lift.name,
        exercises: [...exerciseBuilder(lift, trainingMaxKg), ...(accessory ? [accessory] : [])],
      };
    });

/**
 * Конструктор 5/3/1: тренировочный максимум = 85–90 % от 1ПМ,
 * рабочие подходы 65/75/85 → 70/80/90 → 75/85/95, четвёртая неделя — разгрузка.
 */
export function buildFiveThreeOne(input: ProgramBuilderInput): WorkoutProgram {
  return {
    id: `program-531-${Date.now()}`,
    name: input.name?.trim() || "5/3/1 — мой цикл",
    type: "fiveThreeOne",
    mode: input.mode,
    notes: `Тренировочный максимум — ${input.trainingMaxPercent} % от 1ПМ. Последний подход недели делается «до отказа» (+). Разгрузочная неделя — 40/50/60 %. После цикла добавьте 2.5 кг к жимам и 5 кг к тягам и приседу.`,
    trainingMaxes: Object.fromEntries(
      input.lifts.filter((lift) => lift.name.trim()).map((lift) => [lift.name, roundToStep((lift.maxKg * input.trainingMaxPercent) / 100)]),
    ),
    days: buildDays(
      input,
      (_lift, trainingMaxKg) =>
        FIVE_THREE_ONE_BLOCKS.map((block) => ({
          name: block.label,
          sets: block.sets.length,
          reps: block.sets.map((set) => `${set.reps}${set.amrap ? "+" : ""}`).join("/"),
          note: block.label.includes("разгрузка") ? "Лёгкая неделя: работа без отказа" : `Последний подход — до отказа`,
          percentBaseKg: trainingMaxKg,
          setsPlan: block.sets.map((set) => plannedSet(trainingMaxKg, set.percent, set.reps, block.label, set.amrap)),
        })),
      () =>
        FIVE_THREE_ONE_BLOCKS.map((block) => ({
          label: block.label,
          percent: block.sets[0]!.percent,
          isDeload: block.label.includes("разгрузка"),
        })),
    ),
  };
}

/**
 * Конструктор Juggernaut: волны 10 → 8 → 5 → 3 повтора, три недели нарастающей
 * интенсивности плюс разгрузка. Проценты считаются от тренировочного максимума.
 */
export function buildJuggernaut(input: ProgramBuilderInput): WorkoutProgram {
  return {
    id: `program-juggernaut-${Date.now()}`,
    name: input.name?.trim() || "Juggernaut — мой цикл",
    type: "juggernaut",
    mode: input.mode,
    notes: `Тренировочный максимум — ${input.trainingMaxPercent} % от 1ПМ. В каждой волне три недели роста и разгрузка; последняя неделя волны выполняется «до отказа». После волны прибавьте 5 кг к тягам и приседу и 2.5 кг к жимам.`,
    trainingMaxes: Object.fromEntries(
      input.lifts.filter((lift) => lift.name.trim()).map((lift) => [lift.name, roundToStep((lift.maxKg * input.trainingMaxPercent) / 100)]),
    ),
    days: buildDays(
      input,
      (_lift, trainingMaxKg) =>
        JUGGERNAUT_WAVES.map((wave) => ({
          name: wave.name,
          sets: 4,
          reps: `${wave.reps}`,
          note: `Недели 1–3: ${wave.percents.join("/")} %, последняя — до отказа. Разгрузка: ${wave.deloadPercent} %.`,
          percentBaseKg: trainingMaxKg,
          setsPlan: [
            ...wave.percents.map((percent, index) =>
              plannedSet(trainingMaxKg, percent, wave.reps, `Неделя ${index + 1}`, index === wave.percents.length - 1),
            ),
            plannedSet(trainingMaxKg, wave.deloadPercent, wave.reps, "Разгрузка"),
          ],
        })),
      () => JUGGERNAUT_WAVES.map((wave, index) => ({ label: `Волна ${index + 1}`, percent: wave.percents[0] })),
    ),
  };
}

/** Тренировочный максимум по умолчанию, если пользователь ничего не менял. */
export const getDefaultLifts = (trainingMaxes?: Record<string, number>): ProgramLiftInput[] =>
  DEFAULT_LIFT_NAMES.map((name) => ({ name, maxKg: trainingMaxes?.[name] ?? 0 }));
