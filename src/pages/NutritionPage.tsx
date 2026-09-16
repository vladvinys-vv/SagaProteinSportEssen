import { useMemo, useState } from "react";
import { ArrowRight, Barcode, Camera, ChevronLeft, ChevronRight, Plus, Search, Trash2, Utensils, Wine } from "lucide-react";
import { Card, EmptyState, ProgressBar, SectionHeader } from "@/components/UI";
import { calculateAlcoholCalories, calculateDailyTotals, calculateMacroTargets, dateKey, getNormalizedPrice, getPriceCategory, scaleNutrition } from "@/lib/calculations";
import { useAppState } from "@/state/AppContext";
import type { Currency, Food, MealEntry, MealPreset, MealType, PriceEntry, Recipe } from "@/types";

const mealLabels: Record<MealType, string> = { breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Перекус" };
const mealOrder: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const makeId = () => `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const currencySymbols: Record<Currency, string> = { RUB: "₽", USD: "$", EUR: "€" };

function nutritionFor(food: Food, amount: number) {
  return scaleNutrition(food.calories, food.protein, food.fat, food.carbs, food.sugar, amount);
}

function formatMoney(value: number, currency: Currency) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export default function NutritionPage() {
  const { state, updateState } = useAppState();
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
  const [alcohol, setAlcohol] = useState({ name: "Красное вино", volumeMl: 150, abv: 12.5 });
  const [presetName, setPresetName] = useState("");
  const [presetMeal, setPresetMeal] = useState<MealType>("breakfast");
  const [priceDraft, setPriceDraft] = useState<PriceEntry>({ id: "", productName: "", store: "", city: "", currency: state.profile.currency, packagePrice: 0, date: dateKey() });
  const [priceSort, setPriceSort] = useState<"cheap" | "premium" | "newest">("cheap");

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
  const dayResult = Math.abs(calorieDifference) <= targets.calories * 0.1 ? "Удержал цель" : calorieDifference > 0 ? `Недобрал ${Math.round(calorieDifference)} ккал` : `Набрал ${Math.round(Math.abs(calorieDifference))} ккал сверх цели`;
  const amountUnit = selectedFood?.unit ?? "g";
  const sortedPrices = useMemo(() => [...state.prices].sort((a, b) => {
    if (priceSort === "newest") return b.date.localeCompare(a.date);
    if (a.currency !== b.currency) return a.currency.localeCompare(b.currency);
    const difference = getNormalizedPrice(a) - getNormalizedPrice(b);
    return priceSort === "premium" ? -difference : difference;
  }), [state.prices, priceSort]);
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
  const addAlcohol = () => {
    if (alcohol.volumeMl <= 0 || alcohol.abv <= 0) return;
    updateState({ alcohol: [{ id: makeId(), date, name: alcohol.name, volumeMl: alcohol.volumeMl, abv: alcohol.abv, calories: Math.round(calculateAlcoholCalories(alcohol.volumeMl, alcohol.abv)) }, ...state.alcohol] });
  };
  const addRecipe = (recipe: Recipe) => {
    const entry: MealEntry = { id: makeId(), date, meal, name: recipe.name, amountG: 350, calories: recipe.calories, protein: recipe.protein, fat: recipe.fat, carbs: recipe.carbs, sugar: 0, source: "preset", junkFood: false };
    updateState({ meals: [entry, ...state.meals] });
  };
  const addPrice = () => {
    const packageSize = priceDraft.packageSizeG ?? priceDraft.packageSizeMl;
    if (!priceDraft.productName.trim() || !priceDraft.store.trim() || !priceDraft.city.trim() || priceDraft.packagePrice <= 0 || !packageSize || packageSize <= 0) return;
    const matchingFood = foods.find((food) => food.name.toLowerCase() === priceDraft.productName.trim().toLowerCase());
    updateState({ prices: [{ ...priceDraft, id: `price-${Date.now()}`, productId: matchingFood?.id, productName: priceDraft.productName.trim(), store: priceDraft.store.trim(), city: priceDraft.city.trim() }, ...state.prices] });
    setPriceDraft({ id: "", productName: "", store: "", city: "", currency: state.profile.currency, packagePrice: 0, date: dateKey() });
  };

  return <div className="page-content">
    <div className="page-title-row"><div><span className="eyebrow">Питание</span><h1>Каждый приём на виду</h1><p>Добавляй продукты, сканируй штрихкоды и сохраняй любимые комбинации.</p></div><div className="title-stat"><Utensils size={17} /><span>За день<strong>{Math.round(totals.calories)} ккал</strong></span></div></div>
    <Card><div className="date-switcher"><button type="button" onClick={() => shiftDate(-1)} aria-label="Предыдущий день"><ChevronLeft size={16} /></button><input type="date" value={date} onChange={(event) => event.target.value && setDate(event.target.value)} /><button type="button" onClick={() => shiftDate(1)} aria-label="Следующий день"><ChevronRight size={16} /></button></div><div className="nutrition-mini"><span>Калории<strong>{Math.round(totals.calories)}</strong></span><span>Белок<strong>{Math.round(totals.protein)} г</strong></span><span>Жиры<strong>{Math.round(totals.fat)} г</strong></span><span>Углеводы<strong>{Math.round(totals.carbs)} г</strong></span><span>Сахар<strong>{Math.round(totals.sugar)} г</strong></span><span>Алкоголь<strong>{Math.round(totals.alcoholCalories)} ккал</strong></span></div><div className="day-result-row"><span className={`day-result ${totals.calories > targets.calories ? "is-over" : ""}`}>{dayResult}</span><small>{totals.alcoholCalories > 0 && `${Math.round(totals.alcoholCalories)} ккал алкоголя уже учтено`}</small></div><div className="target-progress"><ProgressBar value={totals.calories} max={targets.calories} label="Калории" tone={totals.calories > targets.calories ? "warning" : "success"} /><ProgressBar value={totals.protein} max={targets.protein} label="Белок" tone="protein" /><ProgressBar value={totals.fat} max={targets.fat} label="Жиры" tone="warning" /><ProgressBar value={totals.carbs} max={targets.carbs} label="Углеводы" /><ProgressBar value={totals.sugar} max={targets.sugar} label="Сахар" tone="primary" /></div></Card>
    <div className="two-column">
      <Card><SectionHeader eyebrow="Поиск" title="Добавить продукт" /><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например, курица или рис" /></div><div className="food-results">{visibleFoods.slice(0, 6).map((food) => <button type="button" key={food.id} className={`food-result ${food.id === selectedFoodId ? "is-selected" : ""}`} onClick={() => { setSelectedFoodId(food.id); setBarcodeSource("database"); setQuery(""); }}><span><strong>{food.name}</strong><small>{food.category} · {food.calories} ккал / 100 {food.unit}</small></span><ArrowRight size={14} /></button>)}</div><div className="form-grid"><label><span>Продукт</span><input value={selectedFood?.name ?? ""} readOnly /></label><label><span>Количество, {amountUnit === "ml" ? "мл" : "г"}</span><input type="number" min="1" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label><label><span>Приём пищи</span><select value={meal} onChange={(event) => setMeal(event.target.value as MealType)}>{mealOrder.map((type) => <option key={type} value={type}>{mealLabels[type]}</option>)}</select></label><label className="check-row"><input type="checkbox" checked={junkFood} onChange={(event) => setJunkFood(event.target.checked)} /><span>Отметить как джанк-фуд</span></label></div><button className="button primary full" type="button" disabled={!selectedFood || amount <= 0} onClick={() => selectedFood && addEntry(selectedFood)}><Plus size={17} /> Добавить в дневник</button><div className="barcode-row"><div className="search-field"><Barcode size={16} /><input value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="Штрихкод" /></div><button className="button secondary" type="button" onClick={findBarcode}>Найти</button></div>{barcodeMessage && <p className="muted">{barcodeMessage}</p>}</Card>
      <Card><SectionHeader eyebrow="Свои продукты" title="Создать позицию" /><div className="product-form-grid"><label><span>Название</span><input value={custom.name} onChange={(event) => setCustom({ ...custom, name: event.target.value })} /></label><label><span>Калории / 100 {custom.unit === "ml" ? "мл" : "г"}</span><input type="number" min="0" value={custom.calories} onChange={(event) => setCustom({ ...custom, calories: Number(event.target.value) })} /></label><label><span>Белок, г</span><input type="number" min="0" step="0.1" value={custom.protein} onChange={(event) => setCustom({ ...custom, protein: Number(event.target.value) })} /></label><label><span>Жиры, г</span><input type="number" min="0" step="0.1" value={custom.fat} onChange={(event) => setCustom({ ...custom, fat: Number(event.target.value) })} /></label><label><span>Углеводы, г</span><input type="number" min="0" step="0.1" value={custom.carbs} onChange={(event) => setCustom({ ...custom, carbs: Number(event.target.value) })} /></label><label><span>Сахар, г</span><input type="number" min="0" step="0.1" value={custom.sugar} onChange={(event) => setCustom({ ...custom, sugar: Number(event.target.value) })} /></label><label><span>Единица</span><select value={custom.unit} onChange={(event) => setCustom({ ...custom, unit: event.target.value as "g" | "ml" })}><option value="g">граммы</option><option value="ml">миллилитры</option></select></label></div><button className="button secondary full" type="button" disabled={!custom.name.trim()} onClick={addCustomFood}><Plus size={17} /> Сохранить продукт</button><div className="capability-note"><Utensils size={16} /><span>Пользовательские продукты остаются в локальной базе и доступны в поиске.</span></div></Card>
    </div>
    <Card><SectionHeader eyebrow="Дневник" title={date === dateKey() ? "Сегодня" : date} action={<span className="day-result">{entries.length + alcoholEntries.length} записей</span>} /><div className="meal-groups">{mealOrder.map((type) => { const group = entries.filter((entry) => entry.meal === type); if (!group.length) return null; const groupTotals = group.reduce((result, entry) => ({ calories: result.calories + entry.calories, protein: result.protein + entry.protein }), { calories: 0, protein: 0 }); return <div key={type}><div className="meal-group-title"><span>{mealLabels[type]}</span><strong>{Math.round(groupTotals.calories)} ккал · {Math.round(groupTotals.protein)} г белка</strong></div>{group.map((entry) => <div className="meal-entry" key={entry.id}><div><strong>{entry.name} {entry.junkFood && <em>джанк</em>}</strong><small>{entry.source === "custom" ? "custom" : "database"} {entry.amountG} {entry.foodId?.startsWith("custom-") || entry.source === "custom" ? "свой продукт" : "продукт"}</small></div><button className="icon-button danger" type="button" aria-label={`Удалить ${entry.name}`} onClick={() => updateState({ meals: state.meals.filter((item) => item.id !== entry.id) })}><Trash2 size={14} /></button></div>)}</div>; })}{alcoholEntries.map((entry) => <div className="meal-entry" key={entry.id}><div><strong>{entry.name}</strong><small>{entry.volumeMl} мл · {entry.abv}% · {Math.round(entry.calories)} ккал алкоголя</small></div><button className="icon-button danger" type="button" aria-label={`Удалить ${entry.name}`} onClick={() => updateState({ alcohol: state.alcohol.filter((item) => item.id !== entry.id) })}><Trash2 size={14} /></button></div>)}</div>{entries.length === 0 && alcoholEntries.length === 0 && <EmptyState title="Пока пусто" text="Добавь первый продукт, напиток или выбери готовый пресет." />}</Card>
    <div className="two-column">
      <Card><SectionHeader eyebrow="Готовые сценарии" title="Пресеты" /><div className="preset-list">{state.presets.map((preset) => <div className="preset-item" key={preset.id}><div><strong>{preset.name}</strong><small>{mealLabels[preset.meal]} · {preset.entries.length} продукта · {Math.round(preset.entries.reduce((total, entry) => total + entry.calories, 0))} ккал</small></div><div className="preset-actions"><button className="button ghost" type="button" onClick={() => addPreset(preset)}>Добавить</button><button className="icon-button danger" type="button" aria-label={`Удалить пресет ${preset.name}`} onClick={() => removePreset(preset.id)}><Trash2 size={14} /></button></div></div>)}</div><div className="preset-save-form"><label><span>Название нового пресета</span><input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="Например, рабочий обед" /></label><label><span>Сохранить приём</span><select value={presetMeal} onChange={(event) => setPresetMeal(event.target.value as MealType)}>{mealOrder.map((type) => <option key={type} value={type}>{mealLabels[type]}</option>)}</select></label><button className="button secondary full" type="button" disabled={!presetName.trim() || entries.filter((entry) => entry.meal === presetMeal).length === 0} onClick={savePreset}><Plus size={16} /> Сохранить текущий приём</button></div></Card>
      <Card><SectionHeader eyebrow="Напитки" title="Алкоголь" /><div className="form-grid"><label><span>Название</span><input value={alcohol.name} onChange={(event) => setAlcohol({ ...alcohol, name: event.target.value })} /></label><label><span>Объём, мл</span><input type="number" min="1" value={alcohol.volumeMl} onChange={(event) => setAlcohol({ ...alcohol, volumeMl: Number(event.target.value) })} /></label><label><span>Крепость, %</span><input type="number" min="0.1" max="100" step="0.1" value={alcohol.abv} onChange={(event) => setAlcohol({ ...alcohol, abv: Number(event.target.value) })} /></label></div><button className="button secondary full" type="button" onClick={addAlcohol}><Plus size={17} /> Добавить напиток</button><div className="alcohol-inline"><Wine size={16} /><span>Калории алкоголя учитываются в дневной сумме и adherence, но не входят в макросы еды.</span></div></Card>
    </div>
    <Card><SectionHeader eyebrow="Рецепты" title="Простые комбинации" /><div className="recipe-grid">{state.recipes.map((recipe) => <article className="recipe-card" key={recipe.id}><div className="recipe-top"><div className="recipe-icon"><Utensils size={17} /></div><h3>{recipe.name}</h3><p>{recipe.description}</p></div><span className="recipe-kcal">{recipe.calories} ккал</span></div><div className="recipe-macros"><span>Белок<strong>{recipe.protein} г</strong></span><span>Жиры<strong>{recipe.fat} г</strong></span><span>Углеводы<strong>{recipe.carbs} г</strong></span></div><div className="recipe-ingredients">{recipe.ingredients.map((ingredient) => <span key={ingredient}>{ingredient}</span>)}</div><details><summary>Как приготовить</summary><ol>{recipe.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol></details><button className="button ghost full" type="button" onClick={() => addRecipe(recipe)}>Добавить как приём пищи</button></article>)}</div></Card>
    <Card><SectionHeader eyebrow="Цены" title="Наблюдение за продуктами" /><div className="price-form-grid"><label><span>Продукт</span><input value={priceDraft.productName} onChange={(event) => setPriceDraft({ ...priceDraft, productName: event.target.value })} /></label><label><span>Магазин</span><input value={priceDraft.store} onChange={(event) => setPriceDraft({ ...priceDraft, store: event.target.value })} /></label><label><span>Город</span><input value={priceDraft.city} onChange={(event) => setPriceDraft({ ...priceDraft, city: event.target.value })} /></label><label><span>Цена за упаковку</span><input type="number" min="0" value={priceDraft.packagePrice} onChange={(event) => setPriceDraft({ ...priceDraft, packagePrice: Number(event.target.value) })} /></label><label><span>Вес, г</span><input type="number" min="0" value={priceDraft.packageSizeG ?? ""} onChange={(event) => setPriceDraft({ ...priceDraft, packageSizeG: Number(event.target.value) || undefined, packageSizeMl: undefined })} /></label><label><span>Объём, мл</span><input type="number" min="0" value={priceDraft.packageSizeMl ?? ""} onChange={(event) => setPriceDraft({ ...priceDraft, packageSizeMl: Number(event.target.value) || undefined, packageSizeG: undefined })} /></label><label><span>Валюта</span><select value={priceDraft.currency} onChange={(event) => setPriceDraft({ ...priceDraft, currency: event.target.value as Currency })}><option value="RUB">Рубли</option><option value="USD">Доллары</option><option value="EUR">Евро</option></select></label><button className="button secondary" type="button" onClick={addPrice}><Plus size={16} /> Добавить цену</button></div><div className="sort-control"><button type="button" className={priceSort === "cheap" ? "is-active" : undefined} onClick={() => setPriceSort("cheap")}>Дешевле всего</button><button type="button" className={priceSort === "premium" ? "is-active" : undefined} onClick={() => setPriceSort("premium")}>Премиальнее</button><button type="button" className={priceSort === "newest" ? "is-active" : undefined} onClick={() => setPriceSort("newest")}>Сначала новые</button></div><div className="price-list">{sortedPrices.map((price) => { const category = getPriceCategory(state.prices, price.id); return <div className="price-row" key={price.id}><div><strong>{formatMoney(price.packagePrice, price.currency)} <small>/ {price.packageSizeG ?? price.packageSizeMl} {price.packageSizeG ? "г" : "мл"}</small></strong><small>{price.productName} · {price.store} · {price.city}</small><span className="price-category-label">{category === "budget" ? "дешевле всего" : category === "premium" ? "премиальнее" : "средняя цена"}</span></div><span className="price-date">{formatMoney(getNormalizedPrice(price), price.currency)} / 100 {price.packageSizeG ? "г" : "мл"}</span></div>; })}</div></Card>
    <Card><SectionHeader eyebrow="Следующий этап" title="Что пока недоступно в веб-версии" /><div className="capability-note"><Camera size={16} /><span>Распознавание фото тарелки и синхронизация с iOS Health / Google Fit требуют нативного приложения. Сейчас доступны ручной штрихкод, локальная база и ручной ввод активности.</span></div></Card>
  </div>;
}
