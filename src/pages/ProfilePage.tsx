import { Activity, Download, Pencil, RotateCcw, ShieldCheck, Upload, UserRound, Weight } from "lucide-react";
import { useRef, useState } from "react";
import Onboarding from "@/components/Onboarding";
import { Card, ProgressBar, SectionHeader } from "@/components/UI";
import { useFocusSection } from "@/hooks/useFocusSection";
import { calculateMacroTargets, dateKey, getSortedWeightEntries } from "@/lib/calculations";
import { importState } from "@/lib/storage";
import { useAppState } from "@/state/AppContext";
import type { ActivityState } from "@/types";

const activityLabels: Record<ActivityState, string> = { lying: "Лежал", sitting: "Сидел", standing: "На ногах", training: "Тренировка" };

export default function ProfilePage() {
  const { state, updateState, replaceState, resetState } = useAppState();
  useFocusSection();
  const fileInput = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState(state.profile.weightKg);
  const [weightDate, setWeightDate] = useState(dateKey());
  const [steps, setSteps] = useState(state.profile.steps);
  const [importMessage, setImportMessage] = useState("");
  const targets = calculateMacroTargets(state.profile);
  const weights = getSortedWeightEntries(state.weights);
  const exportData = () => { const blob = new Blob([JSON.stringify({ state }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `forma-profile-${dateKey()}.json`; link.click(); URL.revokeObjectURL(url); };
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
    <div className="page-title-row"><div><span className="eyebrow">Профиль</span><h1>Твои параметры</h1><p>Измени цель, активность и веса — расчёты обновятся сразу.</p></div><button className="button secondary" type="button" onClick={() => setEditing(true)}><Pencil size={16} /> Редактировать</button></div>
    <Card className="profile-hero"><div className="profile-avatar"><UserRound size={23} /></div><div><span className="eyebrow">Текущая цель</span><h2>{state.profile.goal === "gain" ? "Набор массы" : state.profile.goal === "cut" ? "Сушка" : state.profile.goal === "recomp" ? "Рекомпозиция" : "Поддержание"}</h2><p>{state.profile.weightKg} кг · {state.profile.heightCm} см · {state.profile.age} лет</p></div><div className="profile-target"><ShieldCheck size={18} /><span>Норма</span><strong>{Math.round(targets.calories)} ккал</strong></div></Card>
    <div className="two-column"><Card><SectionHeader eyebrow="Активность" title="Распределение суток" /><div className="activity-editor compact"><div className="activity-total"><Activity size={20} /><div><strong>Сумма</strong><span>Должно быть 24 часа</span></div><b className={(Object.values(state.profile.activityHours).reduce((sum, value) => sum + value, 0) === 24) ? "is-valid" : "is-invalid"}>{Object.values(state.profile.activityHours).reduce((sum, value) => sum + value, 0).toFixed(1)} ч</b></div><div className="activity-inputs">{(Object.keys(activityLabels) as ActivityState[]).map((key) => <label key={key}><span>{activityLabels[key]}</span><input type="number" min="0" max="24" step="0.5" value={state.profile.activityHours[key]} onChange={(event) => updateState({ profile: { ...state.profile, activityHours: { ...state.profile.activityHours, [key]: Math.max(0, Number(event.target.value) || 0) } } })} /></label>)}</div></div><div className="form-grid"><label><span>Шаги сегодня</span><input type="number" min="0" value={steps} onChange={(event) => setSteps(Number(event.target.value))} /></label><button className="button secondary" type="button" onClick={() => updateState({ profile: { ...state.profile, steps } })}>Сохранить шаги</button></div></Card><Card><SectionHeader eyebrow="Макросы" title="Целевые показатели" /><ProgressBar value={targets.protein} max={targets.protein} label="Белок" tone="protein" /><ProgressBar value={targets.fat} max={targets.fat} label="Жиры" tone="warning" /><ProgressBar value={targets.carbs} max={targets.carbs} label="Углеводы" /><div className="macro-editor"><label><span>Белок, г/кг</span><input type="number" min="0.8" max="4" step="0.1" value={state.profile.proteinGPerKg} onChange={(event) => updateState({ profile: { ...state.profile, proteinGPerKg: Number(event.target.value) } })} /></label><label><span>Жиры, г/кг</span><input type="number" min="0.3" max="3" step="0.1" value={state.profile.fatGPerKg} onChange={(event) => updateState({ profile: { ...state.profile, fatGPerKg: Number(event.target.value) } })} /></label><label><span>Сахар, г/день</span><input type="number" min="0" max="200" value={state.profile.sugarLimitG} onChange={(event) => updateState({ profile: { ...state.profile, sugarLimitG: Number(event.target.value) } })} /></label><label><span>Коррекция, ккал</span><input type="number" min="-1000" max="1000" step="50" value={state.profile.calorieAdjustment} onChange={(event) => updateState({ profile: { ...state.profile, calorieAdjustment: Number(event.target.value) } })} /></label></div></Card></div>
    <Card id="weight"><SectionHeader eyebrow="Вес" title="История замеров" /><div className="form-grid"><label><span>Дата</span><input type="date" value={weightDate} onChange={(event) => event.target.value && setWeightDate(event.target.value)} /></label><label><span>Вес, кг</span><input type="number" min="20" max="300" step="0.1" value={weight} onChange={(event) => setWeight(Number(event.target.value))} /></label><button className="button primary" type="button" onClick={() => updateState({ weights: [{ id: `weight-${Date.now()}`, date: weightDate, weightKg: weight }, ...state.weights.filter((entry) => entry.date !== weightDate)] })}><Weight size={16} /> Добавить замер</button></div><div className="weight-history"><div className="weight-history-title"><Activity size={15} /> Последние замеры</div>{weights.slice(-5).reverse().map((entry) => <div className="weight-history-row" key={entry.id}><span>{entry.date}</span><strong>{entry.weightKg.toFixed(1)} кг</strong></div>)}</div></Card>
    <Card><SectionHeader eyebrow="Данные" title="Резервная копия" /><div className="data-actions"><button type="button" onClick={exportData}><Download size={16} /> Экспорт</button><button type="button" onClick={() => fileInput.current?.click()}><Upload size={16} /> Импорт</button><input ref={fileInput} type="file" accept="application/json" hidden onChange={importData} /><button type="button" onClick={resetState}><RotateCcw size={16} /> Сброс</button></div>{importMessage && <p className="muted" role="status">{importMessage}</p>}<div className="privacy-note"><ShieldCheck size={16} /><span>Данные не отправляются на сервер. Файл экспорта можно хранить отдельно и импортировать в другом браузере.</span></div></Card>
    <Onboarding profile={state.profile} open={editing} onClose={() => setEditing(false)} onSave={(profile) => { updateState({ profile }); setEditing(false); }} />
  </div>;
}
