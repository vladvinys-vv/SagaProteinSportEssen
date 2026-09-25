import { Activity, Flame, Ruler, Save, UserRound, Weight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/UI";
import { GOAL_CALORIE_ADJUSTMENTS, sumActivityHours } from "@/lib/calculations";
import type { Profile } from "@/types";

const labels = { lying: "Лежал", sitting: "Сидел", standing: "На ногах", training: "Тренировка" } as const;
const mets = { lying: 1, sitting: 1.3, standing: 2, training: 6 } as const;

export default function Onboarding({ profile, open, onClose, onSave }: { profile: Profile; open: boolean; onClose: () => void; onSave: (profile: Profile) => void }) {
  const [draft, setDraft] = useState(profile);
  const total = useMemo(() => sumActivityHours(draft), [draft]);
  useEffect(() => { if (open) setDraft(profile); }, [open, profile]);
  if (!open) return null;
  const update = <Key extends keyof Profile>(key: Key, value: Profile[Key]) => setDraft((current) => ({ ...current, [key]: value }));
  const valid = draft.weightKg > 20 && draft.weightKg < 300 && draft.heightCm > 100 && draft.heightCm < 250 && draft.age >= 12 && draft.age <= 120 && total === 24;
  return <div className="modal-backdrop"><Card className="onboarding-modal" as="article" role="dialog" aria-modal="true" aria-label="Настройка профиля">
    <div className="modal-header"><div><span className="eyebrow">Первый запуск</span><h2>Настроим твою норму</h2><p>Данные остаются в этом браузере. Их можно экспортировать в любой момент.</p></div><button className="icon-button" type="button" onClick={onClose} aria-label="Закрыть"><X size={20} /></button></div>
    <div className="onboarding-grid">
      <label><span><Weight size={16} /> Вес, кг</span><input type="number" min="20" max="300" step="0.1" value={draft.weightKg} onChange={(event) => update("weightKg", Number(event.target.value))} /></label>
      <label><span><Ruler size={16} /> Рост, см</span><input type="number" min="100" max="250" step="1" value={draft.heightCm} onChange={(event) => update("heightCm", Number(event.target.value))} /></label>
      <label><span><UserRound size={16} /> Возраст</span><input type="number" min="12" max="120" step="1" value={draft.age} onChange={(event) => update("age", Number(event.target.value))} /></label>
      <label><span>Пол</span><select value={draft.sex} onChange={(event) => update("sex", event.target.value as Profile["sex"])}><option value="male">Мужской</option><option value="female">Женский</option></select></label>
      <label><span><Flame size={16} /> Цель</span><select value={draft.goal} onChange={(event) => update("goal", event.target.value as Profile["goal"])}><option value="gain">Набор</option><option value="maintain">Поддержание</option><option value="recomp">Рекомпозиция</option><option value="cut">Сушка</option></select><small>Базовая коррекция: {GOAL_CALORIE_ADJUSTMENTS[draft.goal] > 0 ? "+" : ""}{GOAL_CALORIE_ADJUSTMENTS[draft.goal]} ккал</small></label>
      <label><span>Валюта цен</span><select value={draft.currency} onChange={(event) => update("currency", event.target.value as Profile["currency"])}><option value="EUR">Евро (€)</option><option value="RUB">Рубли (₽)</option><option value="USD">Доллары ($)</option></select></label>
    </div>
    <div className="activity-editor"><div className="activity-total"><Activity size={20} /><div><strong>Фактические 24 часа</strong><span>Расход считается по MET-часам</span></div><b className={total === 24 ? "is-valid" : "is-invalid"}>{total.toFixed(1)} ч</b></div><div className="activity-inputs">{(Object.keys(labels) as Array<keyof typeof labels>).map((key) => <label key={key}><span>{labels[key]} <small>{mets[key]} MET</small></span><input type="number" min="0" max="24" step="0.5" value={draft.activityHours[key]} onChange={(event) => update("activityHours", { ...draft.activityHours, [key]: Math.max(0, Number(event.target.value) || 0) })} /></label>)}</div></div>
    <div className="macro-editor">
      <label><span>Белок, г/кг</span><input type="number" min="0.8" max="4" step="0.1" value={draft.proteinGPerKg} onChange={(event) => update("proteinGPerKg", Number(event.target.value))} /></label>
      <label><span>Жиры, г/кг</span><input type="number" min="0.3" max="3" step="0.1" value={draft.fatGPerKg} onChange={(event) => update("fatGPerKg", Number(event.target.value))} /></label>
      <label><span>Сахар, г/день</span><input type="number" min="0" max="200" step="5" value={draft.sugarLimitG} onChange={(event) => update("sugarLimitG", Number(event.target.value))} /></label>
      <label><span>Дополнительная коррекция, ккал</span><input type="number" min="-1000" max="1000" step="50" value={draft.calorieAdjustment} onChange={(event) => update("calorieAdjustment", Number(event.target.value))} /></label>
    </div>
    {total !== 24 && <div className="inline-warning" role="alert">Сумма активности должна быть ровно 24 часа.</div>}
    <div className="modal-actions"><button className="button secondary" type="button" onClick={onClose}>Позже</button><button className="button primary" type="button" disabled={!valid} onClick={() => onSave({ ...draft, completed: true })}><Save size={18} /> Сохранить профиль</button></div>
  </Card></div>;
}
