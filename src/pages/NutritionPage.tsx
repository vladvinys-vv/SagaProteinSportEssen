import { useMemo, useState } from "react";
import { ArrowRight, Barcode, ChevronLeft, ChevronRight, Plus, Search, Trash2, Utensils, Wine } from "lucide-react";
import { Card, EmptyState, SectionHeader } from "@/components/UI";
import { calculateAlcoholCalories, dateKey, scaleNutrition } from "@/lib/calculations";
import { useAppState } from "@/state/AppContext";
import type { Food, MealEntry, MealPreset, MealType, Recipe } from "@/types";

const mealLabels: Record<MealType, string> = { breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Перекус" };
const mealOrder: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const makeId = () => `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function nutritionFor(food: Food, amountG: number) {
  return scaleNutrition(food.calories, food.protein, food.fat, food.carbs, food.sugar, amountG);
}

export default function NutritionPage() {
  const { state, updateState } = useAppState();
  const [date, setDate] = useState(dateKey());
  const [query, setQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(state.foods[0]?.id ?? null);
  const [amountG, setAmountG] = useState(100);
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [junkFood, setJunkFood] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [barcodeMessage, setBarcodeMessage] = useState("");
  const [custom, setCustom] = useState<{ name: string; calories: number; protein: number; fat: number; carbs: number; sugar: number; unit: Food["unit"] }>({ name: "", calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, unit: "g" });
  const [alcohol, setAlcohol] = useState({ name: "Красное вино", volumeMl: 150, abv: 12.5 });
  const foods = [...state.foods, ...state.customFoods];
  const selectedFood = foods.find((food) => food.id === selectedFoodId);
  const visibleFoods = useMemo(() => foods.filter((food) => `${food.name} ${food.category}`.toLowerCase().includes(query.trim().toLowerCase())), [foods, query]);
  const entries = state.meals.filter((entry) => entry.date === date);
  const totals = entries.reduce((result, entry) => ({ calories: result.calories + entry.calories, protein: result.protein + entry.protein, fat: result.fat + entry.fat, carbs: result.carbs + entry.carbs, sugar: result.sugar + entry.sugar }), { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 });
  const shiftDate = (days: number) => { const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + days); setDate(next.toISOString().slice(0, 10)); };
  const addEntry = (food: Food, source: MealEntry["source"] = "database") => {
    if (!selectedFood || amountG <= 0) return;
    const nutrition = nutritionFor(food, amountG);
    const entry: MealEntry = { id: makeId(), date, meal, foodId: food.id, name: food.name, amountG, ...nutrition, source, junkFood, barcode: food.barcode };
    updateState({ meals: [entry, ...state.meals] });
    setAmountG(100);
  };
  const addCustomFood = () => {
    if (!custom.name.trim() || custom.calories <= 0) return;
    const food: Food = { id: `custom-${Date.now()}`, name: custom.name.trim(), category: "Пользовательские", calories: custom.calories, protein: custom.protein, fat: custom.fat, carbs: custom.carbs, sugar: custom.sugar, unit: custom.unit };
    updateState({ foods: [...state.foods, food], customFoods: [...state.customFoods, food] });
    setSelectedFoodId(food.id);
    setCustom({ name: "", calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, unit: "g" });
  };
  const findBarcode = () => {
    const food = foods.find((item) => item.barcode === barcode.trim());
    if (food) { setSelectedFoodId(food.id); setBarcodeMessage(`Найдено: ${food.name}`); } else setBarcodeMessage("Продукт с таким штрихкодом не найден");
  };
  const addPreset = (preset: MealPreset) => {
    const newEntries: MealEntry[] = preset.entries.map((entry) => ({ id: makeId(), date, meal: preset.meal, foodId: entry.foodId, name: entry.name, amountG: entry.amountG, calories: entry.calories, protein: entry.protein, fat: entry.fat, carbs: entry.carbs, sugar: entry.sugar, source: "preset", junkFood: entry.junkFood, barcode: entry.barcode }));
    updateState({ meals: [...newEntries, ...state.meals] });
  };
  const addAlcohol = () => {
    if (alcohol.volumeMl <= 0 || alcohol.abv <= 0) return;
    updateState({ alcohol: [{ id: makeId(), date, name: alcohol.name, volumeMl: alcohol.volumeMl, abv: alcohol.abv, calories: Math.round(calculateAlcoholCalories(alcohol.volumeMl, alcohol.abv)) }, ...state.alcohol] });
  };
  const addRecipe = (recipe: Recipe) => {
    const entry: MealEntry = { id: makeId(), date, meal: "lunch", name: recipe.name, amountG: 350, calories: recipe.calories, protein: recipe.protein, fat: recipe.fat, carbs: recipe.carbs, sugar: 0, source: "preset", junkFood: false };
    updateState({ meals: [entry, ...state.meals] });
  };
  return <div className="page-content">
    <div className="page-title-row"><div><span className="eyebrow">Питание</span><h1>Каждый приём на виду</h1><p>Добавляй продукты, сканируй штрихкоды и сохраняй любимые комбинации.</p></div><div className="title-stat"><Utensils size={17} /><span>За день<strong>{Math.round(totals.calories)} ккал</strong></span></div></div>
    <Card><div className="date-switcher"><button type="button" onClick={() => shiftDate(-1)} aria-label="Предыдущий день"><ChevronLeft size={16} /></button><input type="date" value={date} onChange={(event) => event.target.value && setDate(event.target.value)} /><button type="button" onClick={() => shiftDate(1)} aria-label="Следующий день"><ChevronRight size={16} /></button></div><div className="nutrition-mini"><span>Калории<strong>{Math.round(totals.calories)}</strong></span><span>Белок<strong>{Math.round(totals.protein)} г</strong></span><span>Жиры<strong>{Math.round(totals.fat)} г</strong></span><span>Углеводы<strong>{Math.round(totals.carbs)} г</strong></span><span>Сахар<strong>{Math.round(totals.sugar)} г</strong></span></div></Card>
    <div className="two-column">
      <Card><SectionHeader eyebrow="Поиск" title="Добавить продукт" /><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например, курица или рис" /></div><div className="food-results">{visibleFoods.slice(0, 6).map((food) => <button type="button" key={food.id} className={`food-result ${food.id === selectedFoodId ? "is-selected" : ""}`} onClick={() => { setSelectedFoodId(food.id); setQuery(""); }}><span><strong>{food.name}</strong><small>{food.category} · {food.calories} ккал / 100 {food.unit}</small></span><ArrowRight size={14} /></button>)}</div><div className="form-grid"><label><span>Продукт</span><input value={selectedFood?.name ?? ""} readOnly /></label><label><span>Количество, г</span><input type="number" min="1" value={amountG} onChange={(event) => setAmountG(Number(event.target.value))} /></label><label><span>Приём пищи</span><select value={meal} onChange={(event) => setMeal(event.target.value as MealType)}>{mealOrder.map((type) => <option key={type} value={type}>{mealLabels[type]}</option>)}</select></label><label className="check-row"><input type="checkbox" checked={junkFood} onChange={(event) => setJunkFood(event.target.checked)} /><span>Отметить как джанк-фуд</span></label></div><button className="button primary full" type="button" disabled={!selectedFood || amountG <= 0} onClick={() => selectedFood && addEntry(selectedFood)}><Plus size={17} /> Добавить в дневник</button><div className="barcode-row"><div className="search-field"><Barcode size={16} /><input value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="Штрихкод" /></div><button className="button secondary" type="button" onClick={findBarcode}>Найти</button></div>{barcodeMessage && <p className="muted">{barcodeMessage}</p>}</Card>
      <Card><SectionHeader eyebrow="Свои продукты" title="Создать позицию" /><div className="product-form-grid"><label><span>Название</span><input value={custom.name} onChange={(event) => setCustom({ ...custom, name: event.target.value })} /></label><label><span>Калории / 100 {custom.unit}</span><input type="number" min="0" value={custom.calories} onChange={(event) => setCustom({ ...custom, calories: Number(event.target.value) })} /></label><label><span>Белок, г</span><input type="number" min="0" step="0.1" value={custom.protein} onChange={(event) => setCustom({ ...custom, protein: Number(event.target.value) })} /></label><label><span>Жиры, г</span><input type="number" min="0" step="0.1" value={custom.fat} onChange={(event) => setCustom({ ...custom, fat: Number(event.target.value) })} /></label><label><span>Углеводы, г</span><input type="number" min="0" step="0.1" value={custom.carbs} onChange={(event) => setCustom({ ...custom, carbs: Number(event.target.value) })} /></label><label><span>Сахар, г</span><input type="number" min="0" step="0.1" value={custom.sugar} onChange={(event) => setCustom({ ...custom, sugar: Number(event.target.value) })} /></label><label><span>Единица</span><select value={custom.unit} onChange={(event) => setCustom({ ...custom, unit: event.target.value as "g" | "ml" })}><option value="g">граммы</option><option value="ml">миллилитры</option></select></label></div><button className="button secondary full" type="button" disabled={!custom.name.trim()} onClick={addCustomFood}><Plus size={17} /> Сохранить продукт</button><div className="capability-note"><Utensils size={16} /><span>Пользовательские продукты остаются в локальной базе и доступны в поиске.</span></div></Card>
    </div>
    <Card><SectionHeader eyebrow="Дневник" title={date === dateKey() ? "Сегодня" : date} action={<span className="day-result">{entries.length} записей</span>} /><div className="meal-groups">{mealOrder.map((type) => { const group = entries.filter((entry) => entry.meal === type); if (!group.length) return null; const groupTotals = group.reduce((result, entry) => ({ calories: result.calories + entry.calories, protein: result.protein + entry.protein }), { calories: 0, protein: 0 }); return <div key={type}><div className="meal-group-title"><span>{mealLabels[type]}</span><strong>{Math.round(groupTotals.calories)} ккал · {Math.round(groupTotals.protein)} г белка</strong></div>{group.map((entry) => <div className="meal-entry" key={entry.id}><div><strong>{entry.name} {entry.junkFood && <em>джанк</em>}</strong><small>{entry.amountG} г · {Math.round(entry.calories)} ккал · {Math.round(entry.protein)} г белка{entry.source === "custom" ? " · свой продукт" : ""}</small></div><button className="icon-button danger" type="button" aria-label={`Удалить ${entry.name}`} onClick={() => updateState({ meals: state.meals.filter((item) => item.id !== entry.id) })}><Trash2 size={14} /></button></div>)}</div>; })}</div>{entries.length === 0 && <EmptyState title="Пока пусто" text="Добавь первый продукт или выбери готовый пресет." />}</Card>
    <div className="two-column">
      <Card><SectionHeader eyebrow="Готовые сценарии" title="Пресеты" /><div className="preset-list">{state.presets.map((preset) => <div className="preset-item" key={preset.id}><div><strong>{preset.name}</strong><small>{mealLabels[preset.meal]} · {preset.entries.length} продукта · {Math.round(preset.entries.reduce((total, entry) => total + entry.calories, 0))} ккал</small></div><button className="button ghost" type="button" onClick={() => addPreset(preset)}>Добавить</button></div>)}</div></Card>
      <Card><SectionHeader eyebrow="Напитки" title="Алкоголь" /><div className="form-grid"><label><span>Название</span><input value={alcohol.name} onChange={(event) => setAlcohol({ ...alcohol, name: event.target.value })} /></label><label><span>Объём, мл</span><input type="number" min="1" value={alcohol.volumeMl} onChange={(event) => setAlcohol({ ...alcohol, volumeMl: Number(event.target.value) })} /></label><label><span>Крепость, %</span><input type="number" min="0.1" max="100" step="0.1" value={alcohol.abv} onChange={(event) => setAlcohol({ ...alcohol, abv: Number(event.target.value) })} /></label></div><button className="button secondary full" type="button" onClick={addAlcohol}><Plus size={17} /> Добавить напиток</button><div className="alcohol-inline"><Wine size={16} /><span>Калории алкоголя учитываются в дневной сумме, но не входят в макросы еды.</span></div></Card>
    </div>
    <Card><SectionHeader eyebrow="Рецепты" title="Простые комбинации" /><div className="recipe-grid">{state.recipes.map((recipe) => <article className="recipe-card" key={recipe.id}><div className="recipe-top"><div><div className="recipe-icon"><Utensils size={17} /></div><h3>{recipe.name}</h3><p>{recipe.description}</p></div><span className="recipe-kcal">{recipe.calories} ккал</span></div><div className="recipe-macros"><span>Белок<strong>{recipe.protein} г</strong></span><span>Жиры<strong>{recipe.fat} г</strong></span><span>Углеводы<strong>{recipe.carbs} г</strong></span></div><div className="recipe-ingredients">{recipe.ingredients.map((ingredient) => <span key={ingredient}>{ingredient}</span>)}</div><details><summary>Как приготовить</summary><ol>{recipe.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol></details><button className="button ghost full" type="button" onClick={() => addRecipe(recipe)}>Добавить как приём пищи</button></article>)}</div></Card>
    <Card><SectionHeader eyebrow="Цены" title="Наблюдение за продуктами" /><div className="price-list">{state.prices.map((price) => <div className="price-row" key={price.id}><div><strong>{price.packagePrice} ₽ <small>/ {price.packageSizeG ?? price.packageSizeMl} {price.packageSizeG ? "г" : "мл"}</small></strong><small>{price.productName} · {price.store} · {price.city}</small></div><span className="price-date">{price.date.slice(5)}</span></div>)}</div></Card>
  </div>;
}
