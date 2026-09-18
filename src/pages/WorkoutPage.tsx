import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Dumbbell, Plus, Save, Trash2 } from "lucide-react";
import { Card, EmptyState, SectionHeader } from "@/components/UI";
import { dateKey, getNextWorkoutRecommendation } from "@/lib/calculations";
import { useAppState } from "@/state/AppContext";
import type { ExerciseTemplate, ProgramMode, WorkoutDay, WorkoutProgram, WorkoutSet } from "@/types";

const programLabels: Record<WorkoutProgram["type"], string> = {
  fiveThreeOne: "5/3/1",
  juggernaut: "Juggernaut",
  ppl: "PPL",
  startingStrength: "Starting Strength",
  custom: "Пользовательская",
};
const modeLabels: Record<ProgramMode, string> = { strength: "Сила", hypertrophy: "Гипертрофия", general: "Общий режим" };

export default function WorkoutPage() {
  const { state, updateState } = useAppState();
  const [programId, setProgramId] = useState(state.programs[0]?.id ?? "");
  const program = state.programs.find((item) => item.id === programId) ?? state.programs[0];
  const [dayIndex, setDayIndex] = useState(0);
  const [date, setDate] = useState(dateKey());
  const [sets, setSets] = useState<WorkoutSet[]>([{ id: "new-1", exercise: "", weightKg: 0, reps: 0, rpe: 8 }]);
  const [newExercise, setNewExercise] = useState({ name: "", sets: 3, reps: "8–12", note: "" });
  const [customDraft, setCustomDraft] = useState<{ name: string; mode: ProgramMode; days: WorkoutDay[]; activeDay: number }>({
    name: "",
    mode: "hypertrophy",
    days: [{ id: "custom-day-1", name: "День 1", exercises: [] }],
    activeDay: 0,
  });
  const day = program?.days[dayIndex] ?? program?.days[0];
  const nextWeights = useMemo(
    () => (program ? getNextWorkoutRecommendation(program, state.workoutLogs.find((log) => log.programId === program.id)) : {}),
    [program, state.workoutLogs],
  );
  const history = state.workoutLogs.filter((log) => log.programId === program?.id).sort((a, b) => b.date.localeCompare(a.date));
  const activeCustomDay = customDraft.days[customDraft.activeDay];

  const resetSetsForDay = (currentDay?: WorkoutDay) => {
    setSets((currentDay?.exercises ?? []).map((exercise, index) => ({
      id: `day-set-${index}-${Date.now()}`,
      exercise: exercise.name,
      weightKg: 0,
      reps: 0,
      rpe: 8,
    })));
  };

  useEffect(() => {
    setDayIndex(0);
    resetSetsForDay(program?.days[0]);
  }, [program?.id]);

  useEffect(() => {
    resetSetsForDay(day);
  }, [dayIndex, program?.id]);

  const updateProgram = (days: WorkoutDay[]) => {
    if (!program) return;
    updateState({ programs: state.programs.map((item) => item.id === program.id ? { ...item, days } : item) });
  };

  const addExercise = () => {
    if (!day || !newExercise.name.trim()) return;
    const updated = program!.days.map((item, index) =>
      index === dayIndex
        ? {
            ...item,
            exercises: [
              ...item.exercises,
              {
                name: newExercise.name.trim(),
                sets: newExercise.sets,
                reps: newExercise.reps,
                note: newExercise.note.trim() || undefined,
              },
            ],
          }
        : item,
    );
    updateProgram(updated);
    setNewExercise({ name: "", sets: 3, reps: "8–12", note: "" });
  };

  const removeExercise = (exerciseName: string) => {
    if (!day || !program) return;
    updateProgram(program.days.map((item, index) => (index === dayIndex ? { ...item, exercises: item.exercises.filter((exercise) => exercise.name !== exerciseName) } : item)));
  };

  const saveWorkout = () => {
    const completed = sets.filter((set) => set.exercise.trim() && set.weightKg > 0 && set.reps > 0);
    if (!program || !completed.length) return;
    updateState({ workoutLogs: [{ id: `workout-${Date.now()}`, date, programId: program.id, programName: program.name, sets: completed }, ...state.workoutLogs] });
    resetSetsForDay(day);
  };

  const updateCustomDay = (dayUpdate: WorkoutDay) => {
    setCustomDraft({ ...customDraft, days: customDraft.days.map((item, index) => (index === customDraft.activeDay ? dayUpdate : item)) });
  };

  const addCustomExercise = () => {
    if (!activeCustomDay || !newExercise.name.trim()) return;
    updateCustomDay({
      ...activeCustomDay,
      exercises: [
        ...activeCustomDay.exercises,
        {
          name: newExercise.name.trim(),
          sets: newExercise.sets,
          reps: newExercise.reps,
          note: newExercise.note.trim() || undefined,
        },
      ],
    });
    setNewExercise({ name: "", sets: 3, reps: "8–12", note: "" });
  };

  const removeCustomExercise = (exerciseName: string) => {
    if (!activeCustomDay) return;
    updateCustomDay({ ...activeCustomDay, exercises: activeCustomDay.exercises.filter((exercise) => exercise.name !== exerciseName) });
  };

  const addCustomDay = () => {
    setCustomDraft({
      ...customDraft,
      days: [...customDraft.days, { id: `custom-day-${Date.now()}`, name: `День ${customDraft.days.length + 1}`, exercises: [] }],
      activeDay: customDraft.days.length,
    });
  };

  const removeCustomDay = (dayId: string) => {
    if (customDraft.days.length <= 1) return;
    const days = customDraft.days.filter((item) => item.id !== dayId);
    setCustomDraft({ ...customDraft, days, activeDay: Math.min(customDraft.activeDay, days.length - 1) });
  };

  const saveCustomProgram = () => {
    if (!customDraft.name.trim() || customDraft.days.some((item) => item.exercises.length === 0)) return;
    const newProgram: WorkoutProgram = {
      id: `custom-${Date.now()}`,
      name: customDraft.name.trim(),
      type: "custom",
      mode: customDraft.mode,
      days: customDraft.days,
      notes: `Пользовательская программа · ${modeLabels[customDraft.mode]}`,
    };
    updateState({ programs: [...state.programs, newProgram] });
    setProgramId(newProgram.id);
    setCustomDraft({ name: "", mode: "hypertrophy", days: [{ id: `custom-day-${Date.now()}`, name: "День 1", exercises: [] }], activeDay: 0 });
  };

  if (!program || !day) {
    return <div className="page-content"><EmptyState title="Нет программ" text="Создайте пользовательскую программу или выберите готовую." /></div>;
  }

  return <div className="page-content">
    <div className="page-title-row">
      <div><span className="eyebrow">Тренировки</span><h1>Сила в системе</h1><p>Собери свою программу, фиксируй подходы и получай следующий рабочий вес.</p></div>
      <div className="title-stat"><Dumbbell size={17} /><span>Программа<strong>{program.name}</strong></span></div>
    </div>

    <Card>
      <SectionHeader eyebrow="Программы" title="Выбери план" />
      <div className="program-grid">
        {state.programs.map((item) => (
          <button type="button" key={item.id} className={`program-card ${item.id === program.id ? "is-selected" : ""}`} onClick={() => { setProgramId(item.id); setDayIndex(0); }}>
            <strong>{item.name}</strong>
            <span className="program-type">{programLabels[item.type]}{item.mode && ` · ${modeLabels[item.mode]}`}</span>
            <small>{item.days.length} дня · {item.days.flatMap((dayItem) => dayItem.exercises).length} упражнений</small>
            <small>{item.notes}</small>
            {item.id === program.id && <Check size={16} />}
          </button>
        ))}
      </div>
      <div className="program-notes"><Dumbbell size={16} /><span>{program.notes}</span></div>
    </Card>

    <Card>
      <SectionHeader eyebrow="Конструктор" title="Пользовательская программа" />
      <div className="program-constructor">
        <div className="constructor-fields">
          <label><span>Название программы</span><input value={customDraft.name} onChange={(event) => setCustomDraft({ ...customDraft, name: event.target.value })} placeholder="Например, 3 дня в неделю" /></label>
          <label><span>Тип / режим</span><select value={customDraft.mode} onChange={(event) => setCustomDraft({ ...customDraft, mode: event.target.value as ProgramMode })}><option value="strength">Сила</option><option value="hypertrophy">Гипертрофия</option><option value="general">Общий режим</option></select></label>
        </div>
        <div className="constructor-days">
          {customDraft.days.map((item, index) => (
            <div key={item.id} className={`constructor-day ${index === customDraft.activeDay ? "is-active" : ""}`}>
              <button type="button" onClick={() => setCustomDraft({ ...customDraft, activeDay: index })}>{item.name}</button>
              {customDraft.days.length > 1 && <button type="button" className="icon-button danger" aria-label={`Удалить ${item.name}`} onClick={() => removeCustomDay(item.id)}><Trash2 size={13} /></button>}
            </div>
          ))}
        </div>
        <button className="button ghost" type="button" onClick={addCustomDay}><Plus size={15} /> Добавить день</button>
        {activeCustomDay && (
          <div className="constructor-exercises">
            {activeCustomDay.exercises.length === 0 && <EmptyState title="У дня пока нет упражнений" text="Добавьте первое упражнение ниже." />}
            {activeCustomDay.exercises.map((exercise) => (
              <div className="constructor-exercise" key={exercise.name}>
                <div><strong>{exercise.name}</strong><small>{exercise.sets} подходов · {exercise.reps}{exercise.note ? ` · ${exercise.note}` : ""}</small></div>
                <button className="icon-button danger" type="button" aria-label={`Удалить ${exercise.name}`} onClick={() => removeCustomExercise(exercise.name)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="add-exercise-form constructor-form">
          <label><span>Упражнение</span><input value={newExercise.name} onChange={(event) => setNewExercise({ ...newExercise, name: event.target.value })} placeholder="Например, тяга блока" /></label>
          <label><span>Подходы</span><input type="number" min="1" value={newExercise.sets} onChange={(event) => setNewExercise({ ...newExercise, sets: Math.max(1, Number(event.target.value) || 1) })} /></label>
          <label><span>Повторы</span><input value={newExercise.reps} onChange={(event) => setNewExercise({ ...newExercise, reps: event.target.value })} placeholder="8–12" /></label>
          <label><span>Комментарий</span><input value={newExercise.note} onChange={(event) => setNewExercise({ ...newExercise, note: event.target.value })} placeholder="RPE 8" /></label>
          <button className="button secondary" type="button" onClick={addCustomExercise}><Plus size={16} /> Добавить упражнение</button>
        </div>
        <button className="button primary full" type="button" disabled={!customDraft.name.trim() || customDraft.days.some((item) => item.exercises.length === 0)} onClick={saveCustomProgram}><Save size={17} /> Сохранить программу</button>
        <p className="constructor-hint">Режим влияет на авторасчёт прогрессии: сила и общий режим добавляют вес при RPE ≤ 8, гипертрофия — при выполнении верхней границы повторов.</p>
      </div>
    </Card>

    <Card>
      <div className="section-heading"><div><span className="eyebrow">Сегодняшний день</span><h2>{day.name}</h2></div><CalendarDays size={19} /></div>
      <div className="day-tabs">{program.days.map((item, index) => <button type="button" key={item.id} className={index === dayIndex ? "is-active" : undefined} onClick={() => setDayIndex(index)}>{item.name}</button>)}</div>
      <div className="exercise-list">
        {day.exercises.map((exercise) => (
          <div className="exercise-row" key={exercise.name}>
            <div><strong>{exercise.name}</strong><small>{exercise.sets} подходов · {exercise.reps} повторов{exercise.note ? ` · ${exercise.note}` : ""}</small></div>
            <span className="next-weight">следующий вес {nextWeights[exercise.name]?.toFixed(1) ?? "0.0"} кг</span>
            <button className="icon-button danger" type="button" aria-label={`Удалить ${exercise.name}`} onClick={() => removeExercise(exercise.name)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <div className="add-exercise-form">
        <label><span>Новое упражнение</span><input value={newExercise.name} onChange={(event) => setNewExercise({ ...newExercise, name: event.target.value })} placeholder="Например, тяга блока" /></label>
        <label><span>Подходы</span><input type="number" min="1" value={newExercise.sets} onChange={(event) => setNewExercise({ ...newExercise, sets: Math.max(1, Number(event.target.value) || 1) })} /></label>
        <label><span>Повторы</span><input value={newExercise.reps} onChange={(event) => setNewExercise({ ...newExercise, reps: event.target.value })} placeholder="8–12" /></label>
        <label><span>Комментарий</span><input value={newExercise.note} onChange={(event) => setNewExercise({ ...newExercise, note: event.target.value })} placeholder="RPE 8" /></label>
        <button className="button secondary" type="button" onClick={addExercise}><Plus size={16} /> Добавить</button>
      </div>
    </Card>

    <Card>
      <SectionHeader eyebrow="Журнал" title="Записать тренировку" />
      <div className="workout-form">
        <label><span>Дата</span><input type="date" value={date} onChange={(event) => event.target.value && setDate(event.target.value)} /></label>
        {sets.map((set, index) => (
          <div className="pending-sets" key={set.id}>
            <div>
              <span>{index + 1}</span>
              <input value={set.exercise} onChange={(event) => setSets(sets.map((item, itemIndex) => itemIndex === index ? { ...item, exercise: event.target.value } : item))} placeholder="Упражнение" />
              <input type="number" min="0" step="0.5" value={set.weightKg} onChange={(event) => setSets(sets.map((item, itemIndex) => itemIndex === index ? { ...item, weightKg: Number(event.target.value) } : item))} placeholder="Кг" />
              <input type="number" min="0" value={set.reps} onChange={(event) => setSets(sets.map((item, itemIndex) => itemIndex === index ? { ...item, reps: Number(event.target.value) } : item))} placeholder="Повторы" />
              <input type="number" min="1" max="10" step="0.5" value={set.rpe ?? 8} onChange={(event) => setSets(sets.map((item, itemIndex) => itemIndex === index ? { ...item, rpe: Number(event.target.value) } : item))} placeholder="RPE" />
              <button className="icon-button danger" type="button" aria-label="Удалить подход" onClick={() => setSets(sets.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        <button className="button ghost" type="button" onClick={() => setSets([...sets, { id: `new-${Date.now()}`, exercise: "", weightKg: 0, reps: 0, rpe: 8 }])}><Plus size={16} /> Ещё подход</button>
        <button className="button primary" type="button" disabled={!sets.some((set) => set.exercise && set.weightKg > 0 && set.reps > 0)} onClick={saveWorkout}><Save size={17} /> Сохранить тренировку</button>
      </div>
    </Card>

    <Card>
      <SectionHeader eyebrow="История" title="Прошлые тренировки" />
      <div className="workout-history">
        {history.length === 0 && <EmptyState title="Истории пока нет" text="Первая сохранённая тренировка появится здесь." />}
        {history.map((log) => (
          <div className="history-row" key={log.id}>
            <div className="history-icon"><Dumbbell size={16} /></div>
            <div><strong>{log.programName}</strong><span className="history-sets">{log.sets.map((set) => `${set.exercise} ${set.weightKg}×${set.reps}`).join(" · ")}</span><small>{log.date}</small></div>
            <button className="icon-button danger" type="button" aria-label="Удалить тренировку" onClick={() => updateState({ workoutLogs: state.workoutLogs.filter((item) => item.id !== log.id) })}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </Card>
  </div>;
}
