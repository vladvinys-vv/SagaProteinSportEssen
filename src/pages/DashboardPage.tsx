import { Activity, ArrowRight, Candy, ClipboardCheck, Flame, Footprints, HeartPulse, Tag, Utensils } from "lucide-react";
import { Link } from "react-router";
import { Card, ProgressBar, TrendChart } from "@/components/UI";
import { calculateCardioMinutes, calculateDailyTotals, calculateMacroTargets, dateKey, getActivityBreakdown, getNoJunkStreak, getStreakReward } from "@/lib/calculations";
import { getAlcoholStagnation, getNextTreatTier, getPriceComparisons, getTreatTier } from "@/lib/insights";
import { useAppState } from "@/state/AppContext";
import type { ActivityState } from "@/types";

const activityLabels: Record<ActivityState, string> = { lying: "Сон и отдых", sitting: "Сидя", standing: "Стоя", training: "Тренировка" };

export default function DashboardPage() {
  const { state, updateState } = useAppState();
  const today = dateKey();
  const totals = calculateDailyTotals(state.meals, state.alcohol, today);
  const targets = calculateMacroTargets(state.profile);
  const activity = getActivityBreakdown(state.profile);
  const excess = Math.max(0, totals.calories - targets.calories);
  const streak = getNoJunkStreak(state.meals, today);
  const reward = getStreakReward(streak, targets, totals);
  const cardio = [
    { label: "Ходьба", met: 3.5, minutes: calculateCardioMinutes(excess, state.profile.weightKg, 3.5) },
    { label: "Велосипед", met: 7, minutes: calculateCardioMinutes(excess, state.profile.weightKg, 7) },
    { label: "Бег", met: 10, minutes: calculateCardioMinutes(excess, state.profile.weightKg, 10) },
  ];
  const proteinPerKg = state.profile.weightKg > 0 ? totals.protein / state.profile.weightKg : 0;
  const weightTrend = state.weights.slice(-7).map((entry) => ({ label: entry.date.slice(5), value: entry.weightKg }));
  const treatTier = getTreatTier(streak);
  const nextTier = getNextTreatTier(streak);
  const alcoholStagnation = getAlcoholStagnation(state.alcohol, state.profile, 14);
  const priceWatch = getPriceComparisons(state.prices);
  return <div className="page-content">
    <div className="page-title-row"><div><span className="eyebrow">Сводка за сегодня</span><h1>Держи ритм</h1><p>Калории, белок и движение собраны в одном месте.</p></div><div className="title-stat"><HeartPulse size={17} /><span>Цель<strong>{Math.round(targets.calories)} ккал</strong></span></div></div>
    {!state.profile.completed && <Card className="inline-warning"><strong>Профиль ещё не завершён</strong><p>Заполни параметры, чтобы расчёт нормы был точнее.</p></Card>}
    <div className="summary-grid">
      <Card className="summary-card"><span className="summary-icon"><Flame size={17} /></span><span>Калории</span><strong>{Math.round(totals.calories)} <small>/ {Math.round(targets.calories)}</small></strong><small>{excess > 0 ? `${Math.round(excess)} ккал сверх цели` : `${Math.round(targets.calories - totals.calories)} ккал осталось`}</small></Card>
      <Card className="summary-card protein-summary"><span className="summary-icon"><ClipboardCheck size={17} /></span><span>Белок</span><strong>{Math.round(totals.protein)} <small>г</small></strong><small>цель {Math.round(targets.protein)} г</small></Card>
      <Card className="summary-card protein-density-summary"><span className="summary-icon"><ClipboardCheck size={17} /></span><span>Белок на кг</span><strong>{proteinPerKg.toFixed(1)} <small>г/кг</small></strong><small>цель {state.profile.proteinGPerKg} г/кг</small></Card>
      <Card className="summary-card"><span className="summary-icon"><Footprints size={17} /></span><span>Шаги</span><strong>{state.profile.steps.toLocaleString("ru-RU")}</strong><small>обнови вручную в профиле</small></Card>
    </div>
    <Card className="macro-card"><div className="macro-head"><div><span className="eyebrow">Макросы</span><h2>Белок, жиры и углеводы</h2></div><span className="day-result">{totals.calories <= targets.calories ? "В цели" : "Сверх цели"}</span></div><ProgressBar value={totals.protein} max={targets.protein} label="Белок" tone="protein" /><ProgressBar value={totals.fat} max={targets.fat} label="Жиры" tone="warning" /><ProgressBar value={totals.carbs} max={targets.carbs} label="Углеводы" /></Card>
    <div className="two-column">
      <Card><div className="section-heading"><div><span className="eyebrow">Активность</span><h2>Как проходят 24 часа</h2></div></div><div className="activity-editor compact"><div className="activity-total"><Activity size={20} /><div><strong>Фактический день</strong><span>MET-часы влияют на расход</span></div><b className={activity.total === 24 ? "is-valid" : "is-invalid"}>{activity.total.toFixed(1)} ч</b></div><div className="activity-inputs">{(Object.keys(activityLabels) as ActivityState[]).map((key) => <label key={key}><span>{activityLabels[key]} <small>{key === "training" ? "6" : key === "standing" ? "2" : key === "sitting" ? "1.3" : "1"} MET</small></span><input type="number" min="0" max="24" step="0.5" value={state.profile.activityHours[key]} onChange={(event) => updateState({ profile: { ...state.profile, activityHours: { ...state.profile.activityHours, [key]: Math.max(0, Number(event.target.value) || 0) } } })} /></label>)}</div></div></Card>
      <Card><div className="section-heading"><div><span className="eyebrow">Без срывов</span><h2>Серия чистых дней</h2></div><Flame size={20} /></div><div className="streak-display"><Flame size={30} /><strong>{streak}</strong><span>дней без помеченного джанк-фуда</span><div className="streak-milestones">{[3, 7, 14, 30].map((milestone) => <span key={milestone} className={streak >= milestone ? "reached" : ""}>{milestone}<small> дней</small></span>)}</div></div>{treatTier && <div className="treat-summary"><Candy size={17} /><span>Вкусняшка за серию: <strong>{treatTier.name}</strong> — бюджет {treatTier.budgetCalories} ккал. Открыть можно на странице питания.</span></div>}
        {!treatTier && nextTier && <p className="muted">Первый чистый день открывает десерт на {nextTier.budgetCalories} ккал.</p>}
        {reward && <div className="reward-card"><ClipboardCheck size={19} /><div><strong>Награда {reward.milestone} дней: {reward.name}</strong><p>{reward.portionFactor > 0 ? `${reward.calories} ккал · ${reward.protein} г белка · ${reward.note}` : reward.note}</p></div></div>}</Card>
    </div>
    {excess > 0 && <Card className="overage-card"><div className="overage-head"><Flame size={20} /><div><strong>+{Math.round(excess)} ккал</strong><p>Выбери, как вернуть день к цели.</p></div></div><div className="overage-grid"><div><h3>Кардио-компенсация</h3><div className="cardio-options">{cardio.map((option) => <div key={option.label}><span>{option.label} · {option.met} MET</span><strong>{option.minutes} мин</strong></div>)}</div></div><div><h3>Следующий приём пищи</h3><div className="diet-options"><Link className="diet-option" to="/nutrition"><span>Лёгкий −250 ккал</span><strong>белок и овощи</strong></Link><Link className="diet-option" to="/nutrition"><span>Белок + овощи −500 ккал</span><strong>без жёстких ограничений</strong></Link></div></div></div></Card>}
    <Card><div className="section-heading"><div><span className="eyebrow">Динамика</span><h2>Последние замеры</h2></div><Link className="text-button" to="/analytics">Все данные <ArrowRight size={14} /></Link></div>{weightTrend.length > 1 ? <TrendChart data={weightTrend} unit="кг" color="#8ab4ff" /> : <div className="empty-state"><strong>Пока нет истории веса</strong><p>Добавь первый замер в профиле.</p></div>}</Card>
    {alcoholStagnation.status !== "none" && <Card className="overage-card"><div className="overage-head"><Flame size={20} /><div><strong>Алкоголь тормозит прогресс</strong><p>{alcoholStagnation.message}</p></div></div><div className="plateau-actions"><Link className="diet-option" to="/nutrition" state={{ focus: "alcohol" }}><span>Внести напиток</span><strong>и увидеть цену прогрессу</strong></Link></div></Card>}
    <div className="capability-grid"><Link className="capability-card" to="/nutrition"><Utensils size={20} /><div><strong>Запланировать приём пищи</strong><p>Быстрые рецепты, продукты и готовые пресеты.</p></div><ArrowRight className="muted-icon" size={16} /></Link><Link className="capability-card" to="/workouts"><Activity size={20} /><div><strong>Открыть тренировку</strong><p>Программа, рабочие веса и история подходов.</p></div><ArrowRight className="muted-icon" size={16} /></Link><Link className="capability-card" to="/prices"><Tag size={20} /><div><strong>Сравнить цены</strong><p>{priceWatch.length > 0 ? `${priceWatch.length} продуктов: где дешевле, а где изысканнее.` : "Добавь цены и узнай, где выгоднее закупаться."}</p></div><ArrowRight className="muted-icon" size={16} /></Link></div>
  </div>;
}
