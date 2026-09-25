import { ArrowRight, Barcode, Camera, Candy, ChevronLeft, ChevronRight, Flame, Plus, Search, Sparkles, Trash2, Utensils, Wine } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Card, EmptyState, ProgressBar, SectionHeader } from "@/components/UI";
import { useFocusSection } from "@/hooks/useFocusSection";
import { calculateAlcoholCalories, calculateDailyTotals, calculateMacroTargets, calculateRecoveryPlan, dateKey, getAlcoholImpact, getFoodRecommendations, getNoJunkStreak, getRecipeRecommendations, scaleNutrition } from "@/lib/calculations";
import { getAlcoholStagnation, getDailyRemaining, getNextTreatTier, getPriceComparisons, getTreatSuggestions, getTreatTier, TREAT_LADDER } from "@/lib/insights";
import { useAppState } from "@/state/AppContext";
import type { Food, MealEntry, MealPreset, MealType, NutritionFocus, PriceCategory, Recipe } from "@/types";

const mealLabels: Record<MealType, string> = { breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Перекус" };
const mealOrder: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const makeId = () => `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function nutritionFor(food: Food, amount: number) {
  return scaleNutrition(food.calories, food.protein, food.fat, food.carbs, food.sugar, amount);
}

/** Привычные порции: тап — и напиток уже в счётчике. */
const ALCOHOL_PRESETS = [
  { name: "Astra Pils 0,5 л", volumeMl: 500, abv: 4.9 },
  { name: "Радлер 0,5 л", volumeMl: 500, abv: 2.5 },
  { name: "Красное вино 0,2 л", volumeMl: 200, abv: 13 },
  { name: "Глинтвейн 0,2 л", volumeMl: 200, abv: 10 },
];

export default function NutritionPage() {
  const { state, updateState } = useAppState();
  useFocusSection();
  const [date, setDate] = useState(dateKey());
  const [query, setQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(state.foods[0]?.id ?? null);
  const [amount, setAmount] = useState(100);
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [junkFood, setJunkFood] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [barcodeMessage, setBarcodeMessage] = useState("");
  const [barcodeSource, setBarcodeSource] = useState<MealEntry["source"]>("database");
  const [custom, setCustom] = useState<{ name: string; calories: number; protein: number; fat: number; carbs: number; sugar: number; unit: Food["unit"] }>({ name: "", calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, unit: "g" });
  const [alcohol, setAlcohol] = useState({ name: "Astra Pils 0,5 л", volumeMl: 500, abv: 4.9 });
  const [presetName, setPresetName] = useState("");
  const [presetMeal, setPresetMeal] = useState<MealType>("breakfast");
  const [priceCategory, setPriceCategory] = useState<PriceCategory>("budget");
  const [treatMessage, setTreatMessage] = useState("");
  const [nutritionFocus, setNutritionFocus] = useState<NutritionFocus>("protein");
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [recoveryPlanMode, setRecoveryPlanMode] = useState<"strict" | "soft">("soft");

  const foods = useMemo(() => {
    const byId = new Map(state.foods.map((food) => [food.id, food]));
    state.customFoods.forEach((food) => { if (!byId.has(food.id)) byId.set(food.id, food); });
    return [...byId.values()];
  }, [state.customFoods, state.foods]);
  const selectedFood = foods.find((food) => food.id === selectedFoodId);
  const visibleFoods = useMemo(() => foods.filter((food) => `${food.name} ${food.category}`.toLowerCase().includes(query.trim().toLowerCase())), [foods, query]);
  const entries = state.meals.filter((entry) => entry.date === date);
  const alcoholEntries = state.alcohol.filter((entry) => entry.date === date);
  const totals = calculateDailyTotals(state.meals, state.alcohol, date);
  const targets = calculateMacroTargets(state.profile);
  const calorieDifference = targets.calories - totals.calories;
  const excessCalories = Math.max(0, totals.calories - targets.calories);
  const recoveryPlan = calculateRecoveryPlan(excessCalories, state.profile.weightKg, targets.calories);
  const selectedRecoveryPlan = recoveryPlan?.[recoveryPlanMode];
  const alcoholImpact = getAlcoholImpact(totals.alcoholCalories, targets.calories, targets.protein, totals.protein, state.profile.goal);
  const foodRecommendations = useMemo(() => getFoodRecommendations(foods, state.prices, targets, priceCategory, nutritionFocus), [foods, nutritionFocus, priceCategory, state.prices, targets]);
  const recipeRecommendations = useMemo(() => getRecipeRecommendations(state.recipes, selectedFoodIds, targets, nutritionFocus), [nutritionFocus, selectedFoodIds, state.recipes, targets]);
  const dayResult = Math.abs(calorieDifference) <= targets.calories * 0.1 ? "Удержал цель" : calorieDifference > 0 ? `Недобрал ${Math.round(calorieDifference)} ккал` : `Набрал ${Math.round(Math.abs(calorieDifference))} ккал сверх цели`;
  const amountUnit = selectedFood?.unit ?? "g";
  const comparisons = useMemo(() => getPriceComparisons(state.prices), [state.prices]);
  const cheapestOffers = comparisons.slice(0, 3);
  const alcoholStagnation = getAlcoholStagnation(state.alcohol, state.profile, 14);
  const junkStreak = getNoJunkStreak(state.meals, dateKey());
  const treatTier = getTreatTier(junkStreak);
  const nextTier = getNextTreatTier(junkStreak);
  const remaining = getDailyRemaining(targets, totals.calories, totals.protein);
  const treatBudget = treatTier ? Math.min(treatTier.budgetCalories, remaining.calories) : 0;
  const treatSuggestions = useMemo(
    () => getTreatSuggestions(foods, treatBudget, treatTier?.budgetProtein ?? 0),
    [foods, treatBudget, treatTier?.budgetProtein],
  );
  const shiftDate = (days: number) => { const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + days); setDate(next.toISOString().slice(0, 10)); };
  const addEntry = (food: Food, source: MealEntry["source"] = barcodeSource) => {
    if (!food || amount <= 0) return;
    const nutrition = nutritionFor(food, amount);
    const entry: MealEntry = { id: makeId(), date, meal, foodId: food.id, name: food.name, amountG: amount, ...nutrition, source: food.category === "Пользовательские" ? "custom" : source, junkFood, barcode: food.barcode };
    updateState({ meals: [entry, ...state.meals] });
    setAmount(100);
    setBarcodeSource("database");
  };
  const addCustomFood = () => {
    if (!custom.name.trim() || custom.calories <= 0) return;
    const food: Food = { id: `custom-${Date.now()}`, name: custom.name.trim(), category: "Пользовательские", calories: custom.calories, protein: custom.protein, fat: custom.fat, carbs: custom.carbs, sugar: custom.sugar, unit: custom.unit };
    updateState({ customFoods: [...state.customFoods, food] });
    setSelectedFoodId(food.id);
    setCustom({ name: "", calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, unit: "g" });
  };
  const findBarcode = () => {
    const food = foods.find((item) => item.barcode === barcode.trim());
    if (food) { setSelectedFoodId(food.id); setBarcodeSource("barcode"); setBarcodeMessage(`Найдено: ${food.name}`); } else setBarcodeMessage("Продукт с таким штрихкодом не найден");
  };
  const addPreset = (preset: MealPreset) => {
    const newEntries: MealEntry[] = preset.entries.map((entry) => ({ id: makeId(), date, meal: preset.meal, foodId: entry.foodId, name: entry.name, amountG: entry.amountG, calories: entry.calories, protein: entry.protein, fat: entry.fat, carbs: entry.carbs, sugar: entry.sugar, source: "preset", junkFood: entry.junkFood, barcode: entry.barcode }));
    updateState({ meals: [...newEntries, ...state.meals] });
  };
  const removePreset = (presetId: string) => updateState({ presets: state.presets.filter((preset) => preset.id !== presetId) });
  const savePreset = () => {
    const presetEntries = entries.filter((entry) => entry.meal === presetMeal).map((entry) => ({ foodId: entry.foodId, name: entry.name, amountG: entry.amountG, calories: entry.calories, protein: entry.protein, fat: entry.fat, carbs: entry.carbs, sugar: entry.sugar, source: entry.source, junkFood: entry.junkFood, barcode: entry.barcode }));
    if (!presetName.trim() || presetEntries.length === 0) return;
    updateState({ presets: [...state.presets, { id: `preset-${Date.now()}`, name: presetName.trim(), meal: presetMeal, entries: presetEntries }] });
    setPresetName("");
  };
  const addDrink = (drink: { name: string; volumeMl: number; abv: number }) => {
    if (drink.volumeMl <= 0 || drink.abv <= 0) return;
    updateState({ alcohol: [{ id: makeId(), date, name: drink.name, volumeMl: drink.volumeMl, abv: drink.abv, calories: Math.round(calculateAlcoholCalories(drink.volumeMl, drink.abv)) }, ...state.alcohol] });
  };
  const addAlcohol = () => addDrink(alcohol);
  const addRecipe = (recipe: Recipe) => {
    const entry: MealEntry = { id: makeId(), date, meal, name: recipe.name, amountG: 350, calories: recipe.calories, protein: recipe.protein, fat: recipe.fat, carbs: recipe.carbs, sugar: 0, source: "preset", junkFood: false };
    updateState({ meals: [entry, ...state.meals] });
  };
  const toggleFoodSelection = (foodId: string) => setSelectedFoodIds((current) => current.includes(foodId) ? current.filter((id) => id !== foodId) : [...current, foodId]);
  const addTreat = (food: Food, portionG: number) => {
    const nutrition = nutritionFor(food, portionG);
    const entry: MealEntry = { id: makeId(), date, meal: "snack", foodId: food.id, name: `${food.name} · вкусняшка`, amountG: portionG, ...nutrition, source: "database", junkFood: false, barcode: food.barcode };
    updateState({ meals: [entry, ...state.meals] });
    setTreatMessage(`${food.name}: ${portionG} г, ${Math.round(nutrition.calories)} ккал добавлено в перекус.`);
  };

  return <div className="page-content">
    <div className="page-title-row"><div><span className="eyebrow">Питание</span><h1>Каждый приём на виду</h1><p>Добавляй продукты, вручную вводи штрихкоды и подбирай еду под свою цель.</p></div><div className="title-stat"><Utensils size={17} /><span>За день<strong>{Math.round(totals.calories)} ккал</strong></span></div></div>
    <Card><div className="date-switcher"><button type="button" onClick={() => shiftDate(-1)} aria-label="Предыдущий день"><ChevronLeft size={16} /></button><input type="date" value={date} onChange={(event) => event.target.value && setDate(event.target.value)} /><button type="button" onClick={() => shiftDate(1)} aria-label="Следующий день"><ChevronRight size={16} /></button></div><div className="nutrition-mini"><span>Калории<strong>{Math.round(totals.calories)}</strong></span><span>Белок<strong>{Math.round(totals.protein)} г</strong></span><span>Жиры<strong>{Math.round(totals.fat)} г</strong></span><span>Углеводы<strong>{Math.round(totals.carbs)} г</strong></span><span>Сахар<strong>{Math.round(totals.sugar)} г</strong></span><span>Алкоголь<strong>{Math.round(totals.alcoholCalories)} ккал</strong></span></div><div className="day-result-row"><span className={`day-result ${totals.calories > targets.calories ? "is-over" : ""}`}>{dayResult}</span><small>{totals.alcoholCalories > 0 && `${Math.round(totals.alcoholCalories)} ккал алкоголя уже учтено`}</small></div><div className="target-progress"><ProgressBar value={totals.calories} max={targets.calories} label="Калории" tone={totals.calories > targets.calories ? "warning" : "success"} /><ProgressBar value={totals.protein} max={targets.protein} label="Белок" tone="protein" /><ProgressBar value={totals.fat} max={targets.fat} label="Жиры" tone="warning" /><ProgressBar value={totals.carbs} max={targets.carbs} label="Углеводы" /><ProgressBar value={totals.sugar} max={targets.sugar} label="Сахар" tone="primary" /></div>{totals.alcoholCalories > 0 && <div className={`impact-note alcohol-impact-${alcoholImpact.progressEffect}`}><Wine size={16} /><span><strong>Влияние на цель: {alcoholImpact.progressMessage}</strong> После него остаётся {Math.max(0, Math.round(alcoholImpact.remainingCalories))} ккал и {Math.max(0, Math.round(alcoholImpact.remainingProtein))} г белка. Калории учтены, белок напитка не заменяет пищевой.</span></div>}</Card>

    {recoveryPlan && selectedRecoveryPlan && <Card className="recovery-plan"><div className="section-heading"><div><span className="eyebrow">План при переборе</span><h2>+{Math.round(excessCalories)} ккал: верни день к цели</h2></div><div className="plan-tabs"><button type="button" className={recoveryPlanMode === "soft" ? "is-active" : undefined} onClick={() => setRecoveryPlanMode("soft")}>Мягкий</button><button type="button" className={recoveryPlanMode === "strict" ? "is-active" : undefined} onClick={() => setRecoveryPlanMode("strict")}>Строгий</button></div></div><div className="recovery-grid"><div><h3>Кардио-варианты</h3><div className="cardio-options">{recoveryPlan.cardio.map((option) => <div key={option.label}><span>{option.label} · {option.met} MET</span><strong>{option.minutes} мин</strong></div>)}</div></div><div className="plan-detail"><span className="day-result">{selectedRecoveryPlan.days} дн. · −{selectedRecoveryPlan.dailyDeficit} ккал/день</span><h3>{selectedRecoveryPlan.meal}</h3><p>{selectedRecoveryPlan.mealCalories} ккал · {selectedRecoveryPlan.mealProtein} г белка · цель {selectedRecoveryPlan.targetCalories} ккал</p><div className="plan-actions"><LinklessButton label="Выбрать мягкий план" active={recoveryPlanMode === "soft"} onClick={() => setRecoveryPlanMode("soft")} /><LinklessButton label="Выбрать строгий план" active={recoveryPlanMode === "strict"} onClick={() => setRecoveryPlanMode("strict")} /></div></div></div></Card>}

    <div className="two-column">
      <Card id="add-food"><SectionHeader eyebrow="Поиск" title="Добавить продукт" /><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например, курица или рис" /></div><div className="food-results">{visibleFoods.slice(0, 6).map((food) => <button type="button" key={food.id} className={`food-result ${food.id === selectedFoodId ? "is-selected" : ""}`} onClick={() => { setSelectedFoodId(food.id); setBarcodeSource("database"); setQuery(""); }}><span><strong>{food.name}</strong><small>{food.category} · {food.calories} ккал / 100 {food.unit}</small></span><ArrowRight size={14} /></button>)}</div><div className="form-grid"><label><span>Продукт</span><input value={selectedFood?.name ?? ""} readOnly /></label><label><span>Количество, {amountUnit === "ml" ? "мл" : "г"}</span><input type="number" min="1" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label><label><span>Приём пищи</span><select value={meal} onChange={(event) => setMeal(event.target.value as MealType)}>{mealOrder.map((type) => <option key={type} value={type}>{mealLabels[type]}</option>)}</select></label><label className="check-row"><input type="checkbox" checked={junkFood} onChange={(event) => setJunkFood(event.target.checked)} /><span>Отметить как джанк-фуд</span></label></div><button className="button primary full" type="button" disabled={!selectedFood || amount <= 0} onClick={() => selectedFood && addEntry(selectedFood)}><Plus size={17} /> Добавить в дневник</button><div className="barcode-row"><div className="search-field"><Barcode size={16} /><input value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="Штрихкод" /></div><button className="button secondary" type="button" onClick={findBarcode}>Найти</button></div>{barcodeMessage && <p className="muted">{barcodeMessage}</p>}<div className="capability-note"><Camera size={16} /><span>Фото тарелки не распознаётся в веб-версии. Штрихкод можно ввести вручную, а состав — выбрать из локальной базы.</span></div></Card>
      <Card><SectionHeader eyebrow="Свои продукты" title="Создать позицию" /><div className="product-form-grid"><label><span>Название</span><input value={custom.name} onChange={(event) => setCustom({ ...custom, name: event.target.value })} /></label><label><span>Калории / 100 {custom.unit === "ml" ? "мл" : "г"}</span><input type="number" min="0" value={custom.calories} onChange={(event) => setCustom({ ...custom, calories: Number(event.target.value) })} /></label><label><span>Белок, г</span><input type="number" min="0" step="0.1" value={custom.protein} onChange={(event) => setCustom({ ...custom, protein: Number(event.target.value) })} /></label><label><span>Жиры, г</span><input type="number" min="0" step="0.1" value={custom.fat} onChange={(event) => setCustom({ ...custom, fat: Number(event.target.value) })} /></label><label><span>Углеводы, г</span><input type="number" min="0" step="0.1" value={custom.carbs} onChange={(event) => setCustom({ ...custom, carbs: Number(event.target.value) })} /></label><label><span>Сахар, г</span><input type="number" min="0" step="0.1" value={custom.sugar} onChange={(event) => setCustom({ ...custom, sugar: Number(event.target.value) })} /></label><label><span>Единица</span><select value={custom.unit} onChange={(event) => setCustom({ ...custom, unit: event.target.value as "g" | "ml" })}><option value="g">граммы</option><option value="ml">миллилитры</option></select></label></div><button className="button secondary full" type="button" disabled={!custom.name.trim()} onClick={addCustomFood}><Plus size={17} /> Сохранить продукт</button><div className="capability-note"><Utensils size={16} /><span>Пользовательские продукты остаются в локальной базе и доступны в поиске.</span></div></Card>
    </div>

    <Card><SectionHeader eyebrow="Подбор" title="Продукты под цель и цену" action={<div className="filter-control"><select value={nutritionFocus} onChange={(event) => setNutritionFocus(event.target.value as NutritionFocus)}><option value="protein">Больше белка</option><option value="balanced">Баланс БЖУ</option><option value="light">Лёгкий выбор</option></select><select value={priceCategory} onChange={(event) => setPriceCategory(event.target.value as PriceCategory)}><option value="budget">Бюджетная категория</option><option value="medium">Средняя категория</option><option value="premium">Премиальная категория</option></select></div>} /><p className="section-intro-text">Рекомендации учитывают целевые макросы и категорию цен. Отметь продукты, чтобы рецепты ниже подбирались под них.</p><div className="product-grid">{foodRecommendations.map(({ food, priceCategory: category, reason }) => <article className="product-card recommendation-card" key={food.id}><div className="product-top"><div><span className={`product-badge ${category === "budget" ? "fits" : ""}`}>{category === "budget" ? "бюджет" : category === "premium" ? "премиум" : "средняя цена"}</span><h3>{food.name}</h3></div><button type="button" className={`button ghost ${selectedFoodIds.includes(food.id) ? "is-selected" : ""}`} onClick={() => toggleFoodSelection(food.id)}>{selectedFoodIds.includes(food.id) ? "Убрать" : "Выбрать"}</button></div><div className="recipe-macros"><span>Белок<strong>{food.protein} г</strong></span><span>Жиры<strong>{food.fat} г</strong></span><span>Углеводы<strong>{food.carbs} г</strong></span></div><p>{reason}</p></article>)}</div>{foodRecommendations.length === 0 && <EmptyState title="Нет совпадений" text="Добавь цену продукта или выбери другую категорию." />}</Card>

    <Card><SectionHeader eyebrow="Рецепты" title="Под выбранные продукты" action={<span className="day-result">{selectedFoodIds.length} выбрано</span>} /><div className="recipe-grid">{recipeRecommendations.map(({ recipe, matchedFoodIds, reason }) => <article className="recipe-card" key={recipe.id}><div className="recipe-top"><div className="recipe-icon"><Utensils size={17} /></div><div><h3>{recipe.name}</h3><p>{recipe.description}</p><small>{reason}{matchedFoodIds.length > 0 && `: ${matchedFoodIds.map((id) => foods.find((food) => food.id === id)?.name).filter(Boolean).join(", ")}`}</small></div></div><span className="recipe-kcal">{recipe.calories} ккал</span><div className="recipe-macros"><span>Белок<strong>{recipe.protein} г</strong></span><span>Жиры<strong>{recipe.fat} г</strong></span><span>Углеводы<strong>{recipe.carbs} g</strong></span></div><div className="recipe-ingredients">{recipe.ingredients.map((ingredient) => <span key={ingredient}>{ingredient}</span>)}</div><details><summary>Как приготовить</summary><ol>{recipe.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol></details><button className="button ghost full" type="button" onClick={() => addRecipe(recipe)}>Добавить как приём пищи</button></article>)}</div>{recipeRecommendations.length === 0 && <EmptyState title="Рецепты не найдены" text="Выбери продукты или измени фокус цели." />}</Card>

    <Card id="treats"><SectionHeader eyebrow="Вкусняшки" title={treatTier ? `Серия ${junkStreak} ${junkStreak === 1 ? "день" : junkStreak < 5 ? "дня" : "дней"}: ${treatTier.name}` : "Серия чистых дней закрыта"} action={<span className="day-result"><Candy size={14} /> {treatTier ? `${treatTier.budgetCalories} ккал на десерт` : "нужен чистый день"}</span>} />
      <div className="treat-ladder">{TREAT_LADDER.map((tier) => <span key={tier.day} className={junkStreak >= tier.day ? "is-reached" : undefined}><strong>{tier.day}</strong><small>{tier.budgetCalories} ккал</small></span>)}</div>
      {!treatTier && <div className="capability-note"><Sparkles size={16} /><span>Отметь день без джанк-фуда — с первого чистого дня открывается десерт на 120 ккал, дальше бюджет растёт.</span></div>}
      {treatTier && <>
        <div className="treat-summary"><Sparkles size={17} /><span>{treatTier.label}: бюджет на десерт — {treatTier.budgetCalories} ккал и {treatTier.budgetProtein} г белка. В остатке дня {Math.round(remaining.calories)} ккал, поэтому доступно {treatBudget} ккал.</span></div>
        <div className="treat-grid">{treatSuggestions.map((suggestion) => <article className="treat-card" key={suggestion.food.id}><div><strong>{suggestion.food.name}</strong><small>{suggestion.reason}</small></div><div className="treat-macros"><span>{suggestion.calories} ккал</span><span>{suggestion.protein} г белка</span><span>{suggestion.portionG} г</span></div><button className="button ghost full" type="button" onClick={() => addTreat(suggestion.food, suggestion.portionG)}>Съесть и записать</button></article>)}</div>
        {treatSuggestions.length === 0 && <EmptyState title="Остаток дня уже исчерпан" text="Вкусняшка не влезает в план — перенеси серию на завтра или урежь другой приём пищи." />}
        {nextTier && <p className="muted">До следующей ступени ({nextTier.day} дн. — {nextTier.name}) осталось {nextTier.day - junkStreak} дн.</p>}
        {treatMessage && <p className="muted" role="status">{treatMessage}</p>}
      </>}
    </Card>

    <Card><SectionHeader eyebrow="Дневник" title={date === dateKey() ? "Сегодня" : date} action={<span className="day-result">{entries.length + alcoholEntries.length} записей</span>} /><div className="meal-groups">{mealOrder.map((type) => { const group = entries.filter((entry) => entry.meal === type); if (!group.length) return null; const groupTotals = group.reduce((result, entry) => ({ calories: result.calories + entry.calories, protein: result.protein + entry.protein }), { calories: 0, protein: 0 }); return <div key={type}><div className="meal-group-title"><span>{mealLabels[type]}</span><strong>{Math.round(groupTotals.calories)} ккал · {Math.round(groupTotals.protein)} г белка</strong></div>{group.map((entry) => <div className="meal-entry" key={entry.id}><div><strong>{entry.name} {entry.junkFood && <em>джанк</em>}</strong><small>{entry.source === "custom" ? "свой продукт" : "база"} {entry.amountG} {entry.foodId?.startsWith("custom-") || entry.source === "custom" ? "свой продукт" : "продукт"}</small></div><button className="icon-button danger" type="button" aria-label={`Удалить ${entry.name}`} onClick={() => updateState({ meals: state.meals.filter((item) => item.id !== entry.id) })}><Trash2 size={14} /></button></div>)}</div>; })}{alcoholEntries.map((entry) => <div className="meal-entry" key={entry.id}><div><strong>{entry.name}</strong><small>{entry.volumeMl} мл · {entry.abv}% · {Math.round(entry.calories)} ккал алкоголя</small></div><button className="icon-button danger" type="button" aria-label={`Удалить ${entry.name}`} onClick={() => updateState({ alcohol: state.alcohol.filter((item) => item.id !== entry.id) })}><Trash2 size={14} /></button></div>)}</div>{entries.length === 0 && alcoholEntries.length === 0 && <EmptyState title="Пока пусто" text="Добавь первый продукт, напиток или выбери готовый пресет." />}</Card>
    <div className="two-column">
      <Card><SectionHeader eyebrow="Готовые сценарии" title="Пресеты" /><div className="preset-list">{state.presets.map((preset) => <div className="preset-item" key={preset.id}><div><strong>{preset.name}</strong><small>{mealLabels[preset.meal]} · {preset.entries.length} продукта · {Math.round(preset.entries.reduce((total, entry) => total + entry.calories, 0))} ккал</small></div><div className="preset-actions"><button className="button ghost" type="button" onClick={() => addPreset(preset)}>Добавить</button><button className="icon-button danger" type="button" aria-label={`Удалить пресет ${preset.name}`} onClick={() => removePreset(preset.id)}><Trash2 size={14} /></button></div></div>)}</div><div className="preset-save-form"><label><span>Название нового пресета</span><input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="Например, рабочий обед" /></label><label><span>Сохранить приём</span><select value={presetMeal} onChange={(event) => setPresetMeal(event.target.value as MealType)}>{mealOrder.map((type) => <option key={type} value={type}>{mealLabels[type]}</option>)}</select></label><button className="button secondary full" type="button" disabled={!presetName.trim() || entries.filter((entry) => entry.meal === presetMeal).length === 0} onClick={savePreset}><Plus size={16} /> Сохранить текущий приём</button></div></Card>
      <Card id="alcohol"><SectionHeader eyebrow="Напитки" title="Алкоголь" /><div className="alcohol-presets">{ALCOHOL_PRESETS.map((drink) => <button className="button ghost" type="button" key={drink.name} onClick={() => addDrink(drink)}><Wine size={15} /> {drink.name} · {drink.abv} %</button>)}</div><div className="form-grid"><label><span>Название</span><input value={alcohol.name} onChange={(event) => setAlcohol({ ...alcohol, name: event.target.value })} /></label><label><span>Объём, мл</span><input type="number" min="1" value={alcohol.volumeMl} onChange={(event) => setAlcohol({ ...alcohol, volumeMl: Number(event.target.value) })} /></label><label><span>Крепость, %</span><input type="number" min="0.1" max="100" step="0.1" value={alcohol.abv} onChange={(event) => setAlcohol({ ...alcohol, abv: Number(event.target.value) })} /></label></div><button className="button secondary full" type="button" onClick={addAlcohol}><Plus size={17} /> Добавить напиток</button><div className="alcohol-inline"><Wine size={16} /><span>Пресеты — привычные порции: 0,5 л пива, 0,5 л радлера, 0,2 л вина, 0,2 л глинтвейна. Калории алкоголя учитываются в дневной сумме и adherence, но не входят в макросы еды.</span></div>
        <div className={`stagnation-card is-${alcoholStagnation.status}`}>
          <div className="stagnation-head"><Flame size={18} /><strong>Что это стоит прогрессу</strong><span className="status-tag">{alcoholStagnation.status === "risk" ? "тормозит" : alcoholStagnation.status === "watch" ? "под наблюдением" : "чисто"}</span></div>
          <div className="stagnation-grid">
            <span>дозы<strong>{alcoholStagnation.standardDrinks}</strong><small>этанол, 10 г каждая</small></span>
            <span>калории<strong>{alcoholStagnation.totalCalories}</strong><small>за {alcoholStagnation.days} дней</small></span>
            <span>жир<strong>{alcoholStagnation.fatEquivalentG} г</strong><small>эквивалент</small></span>
            <span>дни прогресса<strong>−{alcoholStagnation.delayedDays}</strong><small>при {alcoholStagnation.dailyBudget} ккал/день</small></span>
          </div>
          <p>{alcoholStagnation.message}</p>
        </div></Card>
    </div>
    <Card>
      <SectionHeader eyebrow="Цены" title="Лучшие цены рядом" action={<Link className="text-button" to="/prices">Все сравнения <ArrowRight size={14} /></Link>} />
      {cheapestOffers.length === 0 && <EmptyState title="Пока нет наблюдений" text="Добавь цены на странице «Цены» — здесь появятся лучшие предложения по магазинам." />}
      <div className="best-price-list">
        {cheapestOffers.map((comparison) => (
          <div className="best-price-row" key={comparison.key}>
            <div>
              <strong>{comparison.productName}</strong>
              <small>разброс {comparison.spreadPercent} % между магазинами</small>
            </div>
            <span className="offer is-cheapest">
              <span>дешевле всего</span>
              <strong>{comparison.cheapest.store}</strong>
            </span>
            <span className="offer is-priciest">
              <span>изысканнее всего</span>
              <strong>{comparison.priciest.store}</strong>
            </span>
          </div>
        ))}
      </div>
    </Card>

    <Card><SectionHeader eyebrow="Следующий этап" title="Ограничения веб-версии" /><div className="capability-note"><Camera size={16} /><span>Распознавание фото тарелки и синхронизация с iOS Health / Google Fit не реализованы. Доступны ручной штрихкод, локальная база, ручной ввод активности и веса.</span></div></Card>
  </div>;
}

function LinklessButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" className={`button ${active ? "success" : "ghost"}`} onClick={onClick}>{label}</button>;
}
