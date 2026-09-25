import { Activity, AlertTriangle, CheckCircle2, Download, RotateCcw, ShieldCheck, TrendingUp, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Card, EmptyState, ProgressBar, SectionHeader, TrendChart } from "@/components/UI";
import { calculateDailyTotals, calculateMacroTargets, calculateTargetCalories, dateKey, daysAgoKey, detectPlateau, getAutoCorrection, getCalorieAdherence, getPeriodNutritionSummary, getProteinAdherence, getSortedWeightEntries } from "@/lib/calculations";
import { importState } from "@/lib/storage";
import { useAppState } from "@/state/AppContext";

type Metric = "weight" | "calories" | "protein";

export default function AnalyticsPage() {
  const { state, updateState, replaceState, resetState } = useAppState();
  const fileInput = useRef<HTMLInputElement>(null);
  const [range, setRange] = useState(14);
  const [metric, setMetric] = useState<Metric>("weight");
  const [importMessage, setImportMessage] = useState("");
  const today = dateKey();
  const targets = calculateMacroTargets(state.profile);
  const adherence = getCalorieAdherence(state.meals, state.alcohol, targets.calories, range - 1);
  const proteinAdherence = getProteinAdherence(state.meals, targets.protein, range - 1);
  const periodSummary = getPeriodNutritionSummary(state.meals, state.alcohol, state.weights, targets, range - 1);
  const plateau = detectPlateau(state, today);
  const correction = getAutoCorrection(state, today);
  const days = Array.from({ length: range }, (_, index) => daysAgoKey(range - 1 - index));
  const chartData = metric === "weight"
    ? getSortedWeightEntries(state.weights).filter((entry) => days.includes(entry.date)).map((entry) => ({ label: entry.date.slice(5), value: entry.weightKg }))
    : days.map((day) => {
        const totals = calculateDailyTotals(state.meals, state.alcohol, day);
        return { label: day.slice(5), value: metric === "calories" ? totals.calories : totals.protein };
      }).filter((point) => point.value > 0);
  const applyCalorieAdjustment = (delta: number, reason: string) => {
    const previousTarget = calculateTargetCalories(state.profile);
    const profile = { ...state.profile, calorieAdjustment: state.profile.calorieAdjustment + delta };
    updateState({
      profile,
      adjustments: [{ date: today, previousTarget, newTarget: calculateTargetCalories(profile), reason }, ...state.adjustments].slice(0, 30),
    });
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ state }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `forma-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      replaceState(importState(await file.text()));
      setImportMessage(`Импортировано из ${file.name}`);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Не удалось прочитать файл");
    }
    event.target.value = "";
  };

  return <div className="page-content">
    <div className="page-title-row"><div><span className="eyebrow">Аналитика</span><h1>Что говорят данные</h1><p>Смотри период, adherence и подсказки без лишнего шума.</p></div><div className="title-stat"><TrendingUp size={17} /><span>Период<strong>{range} дней</strong></span></div></div>

    <div className="analytics-overview">
      <Card className="summary-card"><span className="summary-icon"><TrendingUp size={17} /></span><span>Средние калории</span><strong>{periodSummary.averageCalories === null ? "—" : Math.round(periodSummary.averageCalories)} <small>ккал</small></strong><small>{periodSummary.loggedDays} дней с записями</small></Card>
      <Card className="summary-card protein-summary"><span className="summary-icon"><CheckCircle2 size={17} /></span><span>Средний белок</span><strong>{periodSummary.averageProtein === null ? "—" : Math.round(periodSummary.averageProtein)} <small>г</small></strong><small>цель {Math.round(targets.protein)} г</small></Card>
      <Card className="summary-card"><span className="summary-icon"><Activity size={17} /></span><span>Средний вес</span><strong>{periodSummary.averageWeight === null ? "—" : periodSummary.averageWeight.toFixed(1)} <small>кг</small></strong><small>{state.weights.length} замеров всего</small></Card>
      <Card className="summary-card protein-summary"><span className="summary-icon"><CheckCircle2 size={17} /></span><span>Соблюдение белка</span><strong>{Math.round(proteinAdherence.rate * 100)}<small>%</small></strong><small>{proteinAdherence.compliantDays} из {proteinAdherence.loggedDays} дней</small></Card>
    </div>

    <div className="two-column">
      <Card className="analytics-card">
        <SectionHeader eyebrow="График" title={metric === "weight" ? "Вес" : metric === "calories" ? "Калории" : "Белок"} action={<div className="metric-switch"><button type="button" className={metric === "weight" ? "is-active" : undefined} onClick={() => setMetric("weight")}>Вес</button><button type="button" className={metric === "calories" ? "is-active" : undefined} onClick={() => setMetric("calories")}>Калории</button><button type="button" className={metric === "protein" ? "is-active" : undefined} onClick={() => setMetric("protein")}>Белок</button></div>} />
        <div className="range-switch"><button type="button" className={range === 7 ? "is-active" : undefined} onClick={() => setRange(7)}>7 дней</button><button type="button" className={range === 14 ? "is-active" : undefined} onClick={() => setRange(14)}>14 дней</button><button type="button" className={range === 30 ? "is-active" : undefined} onClick={() => setRange(30)}>30 дней</button></div>
        {chartData.length > 1 ? <TrendChart data={chartData} unit={metric === "weight" ? "кг" : metric === "calories" ? "ккал" : "г"} color={metric === "protein" ? "#c3a7ff" : metric === "calories" ? "#ffb36b" : "#8ab4ff"} /> : <EmptyState title="Недостаточно данных" text="Добавь замеры или записи питания." />}
        <div className="analytics-summary"><span><CheckCircle2 size={14} /> adherence {Math.round(adherence * 100)}%</span><span><TrendingUp size={14} /> белок {Math.round(proteinAdherence.rate * 100)}%</span><span><AlertTriangle size={14} /> {plateau ? "плато" : "без плато"}</span></div>
      </Card>
      <Card><SectionHeader eyebrow="Цель" title="Твои ориентиры" /><ProgressBar value={targets.protein} max={targets.protein} label="Белок" tone="protein" /><ProgressBar value={targets.fat} max={targets.fat} label="Жиры" tone="warning" /><ProgressBar value={targets.carbs} max={targets.carbs} label="Углеводы" /><div className="capability-note"><TrendingUp size={16} /><span>Целевые макросы пересчитываются при изменении профиля. Средние значения считаются только по дням с записями питания.</span></div></Card>
    </div>

    <Card><SectionHeader eyebrow="История" title="Коррекции нормы" /><div className="adjustment-list">{state.adjustments.length === 0 && <EmptyState title="Коррекций пока не было" text="Здесь появятся изменения нормы калорий: авто-коррекция по динамике веса и ручные правки." />}{state.adjustments.map((entry) => <div className="adjustment-row" key={`${entry.date}-${entry.newTarget}-${entry.reason}`}><div><strong>{Math.round(entry.previousTarget)} → {Math.round(entry.newTarget)} ккал</strong><small>{entry.reason}</small></div><span>{entry.date}</span></div>)}</div></Card>

    <div className="two-column">
      {plateau && <Card className="overage-card"><div className="overage-head"><AlertTriangle size={20} /><div><strong>Возможно плато</strong><p>Вес почти не меняется, а adherence остаётся высоким.</p></div></div><div className="plateau-body"><AlertTriangle size={19} /><div><strong>Изменение за неделю: {plateau.weeklyChange.toFixed(2)} кг</strong><p>Adherence за последние 14 дней: {Math.round(plateau.adherence * 100)}%. Проверь сон, шаги и точность порций.</p></div></div><div className="plateau-actions"><button type="button" onClick={() => applyCalorieAdjustment(-100, "Плато: ручное снижение нормы")}>−100 ккал</button><button type="button" onClick={() => updateState({ profile: { ...state.profile, steps: state.profile.steps + 1000 } })}>+1000 шагов</button></div></Card>}
      {correction?.active && <Card><div className="section-heading"><div><span className="eyebrow">Авто-коррекция</span><h2>Предложение по цели</h2></div><AlertTriangle size={19} /></div><div className="correction-body"><div className="correction-number"><strong>{correction.suggestedAdjustment > 0 ? "+" : ""}{correction.suggestedAdjustment}</strong><span>ккал к текущей норме</span></div><p>Наблюдаемое изменение {correction.observedWeeklyChange.toFixed(2)} кг за неделю при ожидании {correction.expectedWeeklyChange.toFixed(2)} кг. Среднее потребление: {Math.round(correction.averageCalories)} ккал.</p><button className="button secondary" type="button" onClick={() => applyCalorieAdjustment(correction.suggestedAdjustment, `Авто-коррекция: ${correction.observedWeeklyChange.toFixed(2)} кг/нед против ожидаемых ${correction.expectedWeeklyChange.toFixed(2)} кг`)}>Применить коррекцию</button></div></Card>}
      <Card><SectionHeader eyebrow="Активность" title="Ручной ввод" /><div className="capability-note"><Activity size={16} /><span>Health и Google Fit в веб-версии не подключены. MET-активность и шаги вводятся вручную в профиле и на главной.</span></div><div className="activity-editor compact"><div className="activity-total"><Activity size={20} /><div><strong>Сегодняшний профиль активности</strong><span>Сумма должна давать 24 часа</span></div><b className={Object.values(state.profile.activityHours).reduce((sum, value) => sum + value, 0) === 24 ? "is-valid" : "is-invalid"}>{Object.values(state.profile.activityHours).reduce((sum, value) => sum + value, 0).toFixed(1)} ч</b></div><div className="activity-inputs">{(["lying", "sitting", "standing", "training"] as const).map((key) => <label key={key}><span>{key === "lying" ? "Сон и отдых" : key === "sitting" ? "Сидя" : key === "standing" ? "Стоя" : "Тренировка"}</span><input type="number" min="0" max="24" step="0.5" value={state.profile.activityHours[key]} onChange={(event) => updateState({ profile: { ...state.profile, activityHours: { ...state.profile.activityHours, [key]: Math.max(0, Number(event.target.value) || 0) } } })} /></label>)}</div></div></Card>
      <Card><SectionHeader eyebrow="Данные" title="Экспорт и сброс" /><div className="data-actions"><button type="button" onClick={exportData}><Download size={16} /> Экспорт JSON</button><button type="button" onClick={() => fileInput.current?.click()}><Upload size={16} /> Импорт</button><input ref={fileInput} type="file" accept="application/json" hidden onChange={importData} /></div>{importMessage && <p className="muted" role="status">{importMessage}</p>}<button className="button secondary full" type="button" onClick={resetState}><RotateCcw size={16} /> Сбросить локальные данные</button><div className="privacy-note"><ShieldCheck size={16} /><span>Все данные хранятся только в этом браузере. Импорт заменяет текущее состояние.</span></div></Card>
    </div>
  </div>;
}
