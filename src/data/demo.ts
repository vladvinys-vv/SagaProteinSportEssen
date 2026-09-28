import { calculateAlcoholCalories, dateKey, daysAgoKey, GOAL_CALORIE_ADJUSTMENTS, scaleNutrition } from "@/lib/calculations";
import type { AlcoholEntry, AppState, Food, MealEntry, MealPreset, MealType, PriceEntry, Profile, Recipe, WeightEntry, WorkoutProgram } from "@/types";

export const BASE_FOODS: Food[] = [
  { id: "oats", name: "Овсянка", category: "Крупы", calories: 380, protein: 13, fat: 7, carbs: 62, sugar: 1, unit: "g", barcode: "100000000001" },
  { id: "milk", name: "Молоко 2.5%", category: "Молочные", calories: 54, protein: 3, fat: 2.5, carbs: 5, sugar: 5, unit: "ml", barcode: "100000000002" },
  { id: "banana", name: "Банан", category: "Фрукты", calories: 89, protein: 1.1, fat: 0.3, carbs: 23, sugar: 12, unit: "g", barcode: "100000000003" },
  { id: "chicken", name: "Куриная грудка", category: "Птица", calories: 165, protein: 31, fat: 3.6, carbs: 0, sugar: 0, unit: "g", barcode: "100000000004" },
  { id: "rice", name: "Рис отварной", category: "Крупы", calories: 130, protein: 2.7, fat: 0.3, carbs: 28, sugar: 0, unit: "g", barcode: "100000000005" },
  { id: "broccoli", name: "Брокколи", category: "Овощи", calories: 35, protein: 2.4, fat: 0.4, carbs: 7, sugar: 1.7, unit: "g", barcode: "100000000006" },
  { id: "olive-oil", name: "Оливковое масло", category: "Жиры", calories: 884, protein: 0, fat: 100, carbs: 0, sugar: 0, unit: "ml", barcode: "100000000007" },
  { id: "salmon", name: "Лосось", category: "Рыба", calories: 208, protein: 20, fat: 13, carbs: 0, sugar: 0, unit: "g", barcode: "100000000008" },
  { id: "potato", name: "Картофель", category: "Овощи", calories: 77, protein: 2, fat: 0.1, carbs: 17, sugar: 0.8, unit: "g", barcode: "100000000009" },
  { id: "yogurt", name: "Греческий йогурт", category: "Молочные", calories: 59, protein: 10, fat: 0.4, carbs: 3.6, sugar: 3.2, unit: "g", barcode: "100000000010" },
  { id: "whey", name: "Сывороточный протеин", category: "Спортпит", calories: 390, protein: 78, fat: 5, carbs: 7, sugar: 3, unit: "g", barcode: "100000000011" },
  { id: "apple", name: "Яблоко", category: "Фрукты", calories: 52, protein: 0.3, fat: 0.2, carbs: 14, sugar: 10, unit: "g", barcode: "100000000012" },
  { id: "beef", name: "Говядина постная", category: "Мясо", calories: 185, protein: 26, fat: 8, carbs: 0, sugar: 0, unit: "g", barcode: "100000000013" },
  { id: "eggs", name: "Яйца", category: "Белки", calories: 155, protein: 13, fat: 11, carbs: 1.1, sugar: 1.1, unit: "g", barcode: "100000000014" },
  { id: "lentils", name: "Чечевица отварная", category: "Бобовые", calories: 116, protein: 9, fat: 0.4, carbs: 20, sugar: 1.8, unit: "g", barcode: "100000000015" },
  { id: "avocado", name: "Авокадо", category: "Жиры", calories: 160, protein: 2, fat: 15, carbs: 9, sugar: 0.7, unit: "g", barcode: "100000000016" },
  { id: "bread", name: "Хлеб цельнозерновой", category: "Хлеб", calories: 250, protein: 9, fat: 3.5, carbs: 42, sugar: 4, unit: "g", barcode: "100000000017" },
  { id: "tuna", name: "Тунец в собственном соку", category: "Рыба", calories: 116, protein: 26, fat: 1, carbs: 0, sugar: 0, unit: "g", barcode: "100000000018" },
  { id: "berries", name: "Ягоды", category: "Фрукты", calories: 50, protein: 1, fat: 0.4, carbs: 12, sugar: 7, unit: "g", barcode: "100000000019" },
  { id: "cottage", name: "Творог 5%", category: "Молочные", calories: 121, protein: 17, fat: 5, carbs: 3, sugar: 3, unit: "g", barcode: "100000000020" },
  { id: "fruit-salad", name: "Фруктовый салат", category: "Десерты", calories: 65, protein: 0.8, fat: 0.3, carbs: 16, sugar: 13, unit: "g", treat: true, barcode: "100000000021" },
  { id: "berries-yogurt", name: "Ягоды с греческим йогуртом", category: "Десерты", calories: 110, protein: 8, fat: 2.5, carbs: 13, sugar: 11, unit: "g", treat: true, barcode: "100000000022" },
  { id: "protein-icecream", name: "Протеиновое мороженое", category: "Десерты", calories: 140, protein: 12, fat: 4, carbs: 15, sugar: 8, unit: "g", treat: true, barcode: "100000000023" },
  { id: "dark-chocolate", name: "Тёмный шоколад 85%", category: "Десерты", calories: 590, protein: 10, fat: 46, carbs: 22, sugar: 14, unit: "g", treat: true, barcode: "100000000024" },
  { id: "curd-dessert", name: "Творожный десерт", category: "Десерты", calories: 180, protein: 14, fat: 6, carbs: 18, sugar: 12, unit: "g", treat: true, barcode: "100000000025" },
  { id: "panna-cotta", name: "Панна-котта на протеине", category: "Десерты", calories: 210, protein: 16, fat: 9, carbs: 17, sugar: 12, unit: "g", treat: true, barcode: "100000000026" },
  { id: "protein-baking", name: "Выпечка без сахара", category: "Десерты", calories: 260, protein: 12, fat: 12, carbs: 26, sugar: 4, unit: "g", treat: true, barcode: "100000000027" },
];

export const RECIPES: Recipe[] = [
  { id: "bowl-chicken", name: "Боул с курицей и рисом", description: "Сытный приём пищи с понятным соотношением белка и углеводов.", ingredients: ["Куриная грудка", "Рис отварной", "Брокколи", "Оливковое масло"], foodIds: ["chicken", "rice", "broccoli", "olive-oil"], calories: 520, protein: 54, fat: 13, carbs: 49, instructions: ["Отварите рис и брокколи.", "Приготовьте курицу.", "Соберите боул и добавьте масло."], tags: ["обед", "белок", "бюджет"] },
  { id: "salmon-potato", name: "Лосось с картофелем", description: "Плотный ужин с омега-3 и медленными углеводами.", ingredients: ["Лосось", "Картофель", "Брокколи", "Греческий йогурт"], foodIds: ["salmon", "potato", "broccoli", "yogurt"], calories: 590, protein: 47, fat: 20, carbs: 55, instructions: ["Запеките картофель и лосось.", "Подайте с брокколи и йогуртовым соусом."], tags: ["ужин", "рыба"] },
  { id: "protein-oats", name: "Протеиновая овсянка", description: "Быстрый завтрак для добора белка.", ingredients: ["Овсянка", "Молоко 2.5%", "Сывороточный протеин", "Ягоды"], foodIds: ["oats", "milk", "whey", "berries"], calories: 430, protein: 39, fat: 10, carbs: 52, instructions: ["Отварите овсянку на молоке.", "Добавьте протеин и ягоды."], tags: ["завтрак", "белок"] },
  { id: "lentil-beef", name: "Чечевица с говядиной", description: "Бюджетный вариант для набора и поддержания.", ingredients: ["Чечевица отварная", "Говядина постная", "Яйца"], foodIds: ["lentils", "beef", "eggs"], calories: 560, protein: 58, fat: 18, carbs: 43, instructions: ["Прогрейте чечевицу.", "Приготовьте говядину и яйцо.", "Смешайте в глубокой тарелке."], tags: ["обед", "бюджет"] },
  { id: "cottage-berries", name: "Творог с ягодами", description: "Лёгкий перекус перед сном.", ingredients: ["Творог 5%", "Ягоды", "Банан"], foodIds: ["cottage", "berries", "banana"], calories: 270, protein: 23, fat: 6, carbs: 32, instructions: ["Смешайте творог с ягодами.", "Добавьте ломтики банана."], tags: ["перекус", "белок"] },
  { id: "tuna-bread", name: "Тост с тунцом", description: "Быстрый вариант, когда нужно добрать белок.", ingredients: ["Тунец в собственном соку", "Хлеб цельнозерновой", "Авокадо"], foodIds: ["tuna", "bread", "avocado"], calories: 390, protein: 34, fat: 15, carbs: 31, instructions: ["Подсушите хлеб.", "Выложите тунец и авокадо."], tags: ["перекус", "рыба"] },
];

export const PROGRAMS: WorkoutProgram[] = [
  { id: "program-531", name: "5/3/1 — сила", type: "fiveThreeOne", notes: "Тренировочный максимум равен 90% от текущего максимума. Рабочие проценты: 65%, 75%, 85%.", trainingMaxes: { Присед: 100, "Жим лёжа": 70, "Становая тяга": 130, "Жим стоя": 45 }, days: [{ id: "531-a", name: "День A", exercises: [{ name: "Присед", sets: 3, reps: "5/3/1" }, { name: "Жим лёжа", sets: 3, reps: "5/3/1" }, { name: "Тяга горизонтального блока", sets: 3, reps: "8–12" }] }, { id: "531-b", name: "День B", exercises: [{ name: "Становая тяга", sets: 3, reps: "5/3/1" }, { name: "Жим стоя", sets: 3, reps: "5/3/1" }, { name: "Подтягивания", sets: 3, reps: "6–10" }] }] },
  { id: "program-juggernaut", name: "Juggernaut — сила и объём", type: "juggernaut", notes: "Тяжёлые подходы выполняются до RPE 8, затем добавляется объём.", days: [{ id: "jug-a", name: "Верх тела", exercises: [{ name: "Жим лёжа", sets: 4, reps: "4–6", note: "RPE 8" }, { name: "Тяга штанги", sets: 4, reps: "6–8" }, { name: "Жим гантелей", sets: 3, reps: "8–12" }] }, { id: "jug-b", name: "Низ тела", exercises: [{ name: "Присед", sets: 4, reps: "4–6", note: "RPE 8" }, { name: "Румынская тяга", sets: 3, reps: "6–10" }, { name: "Жим ногами", sets: 3, reps: "10–15" }] }] },
  { id: "program-ppl", name: "PPL — гипертрофия", type: "ppl", notes: "Когда все подходы попадают в верхнюю границу повторений, добавьте 2.5 кг.", days: [{ id: "ppl-push", name: "Push", exercises: [{ name: "Жим лёжа", sets: 4, reps: "6–10" }, { name: "Жим гантелей", sets: 3, reps: "8–12" }, { name: "Разведения", sets: 3, reps: "10–15" }] }, { id: "ppl-pull", name: "Pull", exercises: [{ name: "Подтягивания", sets: 4, reps: "6–10" }, { name: "Тяга штанги", sets: 4, reps: "8–12" }, { name: "Сгибания на бицепс", sets: 3, reps: "10–15" }] }, { id: "ppl-legs", name: "Legs", exercises: [{ name: "Присед", sets: 4, reps: "6–10" }, { name: "Румынская тяга", sets: 3, reps: "8–12" }, { name: "Подъёмы на носки", sets: 4, reps: "10–15" }] }] },
  { id: "program-ss", name: "Starting Strength — база", type: "startingStrength", notes: "После успешной тренировки добавьте 2.5 кг к верху тела и 5 кг к тягам/приседу.", days: [{ id: "ss-a", name: "Тренировка A", exercises: [{ name: "Присед", sets: 3, reps: "5" }, { name: "Жим лёжа", sets: 3, reps: "5" }, { name: "Становая тяга", sets: 1, reps: "5" }] }, { id: "ss-b", name: "Тренировка B", exercises: [{ name: "Присед", sets: 3, reps: "5" }, { name: "Жим стоя", sets: 3, reps: "5" }, { name: "Тяга штанги", sets: 3, reps: "5" }] }] },
];

const makeEntry = (date: string, meal: MealType, food: Food, amountG: number, extra: Partial<MealEntry> = {}): MealEntry => ({ id: `${date}-${meal}-${food.id}-${amountG}`, date, meal, foodId: food.id, name: food.name, amountG, ...scaleNutrition(food.calories, food.protein, food.fat, food.carbs, food.sugar, amountG), source: "database", junkFood: false, barcode: food.barcode, ...extra });
const makeProfile = (): Profile => ({ completed: false, weightKg: 78, heightCm: 180, age: 30, sex: "male", goal: "recomp", currency: "EUR", calorieAdjustment: GOAL_CALORIE_ADJUSTMENTS.recomp, proteinGPerKg: 2, fatGPerKg: 0.8, sugarLimitG: 40, activityHours: { lying: 11, sitting: 9, standing: 3, training: 1 }, steps: 8200 });

/**
 * Гамбург: сети, которые реально есть в городе, и ориентир цен на 2025 год
 * (за упаковку, а не за развес). Дискаунтеры сверху, био-маркеты — внизу.
 */
const PRICE_SHEET: Array<[string, string, string, string, number, number]> = [
    ["price-chicken-aldi", "chicken", "Куриная грудка", "Aldi Nord", 3.49, 500],
    ["price-chicken-lidl", "chicken", "Куриная грудка", "Lidl", 3.59, 500],
    ["price-chicken-penny", "chicken", "Куриная грудка", "Penny", 3.69, 500],
    ["price-chicken-netto", "chicken", "Куриная грудка", "Netto", 3.79, 500],
    ["price-chicken-kaufland", "chicken", "Куриная грудка", "Kaufland", 3.89, 500],
    ["price-chicken-rewe", "chicken", "Куриная грудка", "Rewe", 4.29, 500],
    ["price-chicken-edeka", "chicken", "Куриная грудка", "Edeka", 4.49, 500],
    ["price-chicken-alnatura", "chicken", "Куриная грудка", "Alnatura", 11.99, 500],
    ["price-oats-aldi", "oats", "Овсянка", "Aldi Nord", 0.79, 500],
    ["price-oats-lidl", "oats", "Овсянка", "Lidl", 0.85, 500],
    ["price-oats-penny", "oats", "Овсянка", "Penny", 0.89, 500],
    ["price-oats-netto", "oats", "Овсянка", "Netto", 0.95, 500],
    ["price-oats-kaufland", "oats", "Овсянка", "Kaufland", 0.99, 500],
    ["price-oats-rewe", "oats", "Овсянка", "Rewe", 0.99, 500],
    ["price-oats-edeka", "oats", "Овсянка", "Edeka", 1.09, 500],
    ["price-oats-alnatura", "oats", "Овсянка", "Alnatura", 1.99, 500],
    ["price-oats-denns", "oats", "Овсянка", "denn's Biomarkt", 2.29, 500],
    ["price-salmon-aldi", "salmon", "Лосось", "Aldi Nord", 4.99, 250],
    ["price-salmon-lidl", "salmon", "Лосось", "Lidl", 5.49, 250],
    ["price-salmon-netto", "salmon", "Лосось", "Netto", 5.99, 250],
    ["price-salmon-penny", "salmon", "Лосось", "Penny", 6.29, 250],
    ["price-salmon-rewe", "salmon", "Лосось", "Rewe", 6.99, 250],
    ["price-salmon-edeka", "salmon", "Лосось", "Edeka", 7.49, 250],
    ["price-salmon-fischmarkt", "salmon", "Лосось", "Fischmarkt", 8.9, 250],
    ["price-salmon-alnatura", "salmon", "Лосось", "Alnatura", 11.99, 250],
    ["price-quark-aldi", "cottage", "Творог 5%", "Aldi Nord", 0.89, 500],
    ["price-quark-lidl", "cottage", "Творог 5%", "Lidl", 0.95, 500],
    ["price-quark-penny", "cottage", "Творог 5%", "Penny", 0.99, 500],
    ["price-quark-netto", "cottage", "Творог 5%", "Netto", 1.09, 500],
    ["price-quark-rewe", "cottage", "Творог 5%", "Rewe", 1.19, 500],
    ["price-quark-edeka", "cottage", "Творог 5%", "Edeka", 1.25, 500],
    ["price-quark-alnatura", "cottage", "Творог 5%", "Alnatura", 1.99, 500],
    ["price-quark-denns", "cottage", "Творог 5%", "denn's Biomarkt", 2.19, 500],
    ["price-whey-myprotein", "whey", "Сывороточный протеин", "Myprotein", 22.99, 1000],
    ["price-whey-dm", "whey", "Сывороточный протеин", "dm", 26.95, 1000],
    ["price-whey-budni", "whey", "Сывороточный протеин", "Budni", 29.9, 1000],
    ["price-rice-aldi", "rice", "Рис отварной", "Aldi Nord", 1.99, 1000],
    ["price-rice-lidl", "rice", "Рис отварной", "Lidl", 2.19, 1000],
    ["price-rice-netto", "rice", "Рис отварной", "Netto", 2.29, 1000],
    ["price-rice-kaufland", "rice", "Рис отварной", "Kaufland", 2.39, 1000],
    ["price-rice-rewe", "rice", "Рис отварной", "Rewe", 2.49, 1000],
    ["price-rice-edeka", "rice", "Рис отварной", "Edeka", 2.79, 1000],
    ["price-rice-alnatura", "rice", "Рис отварной", "Alnatura", 3.49, 1000],
    ["price-yogurt-aldi", "yogurt", "Греческий йогурт", "Aldi Nord", 1.49, 500],
    ["price-yogurt-lidl", "yogurt", "Греческий йогурт", "Lidl", 1.55, 500],
    ["price-yogurt-penny", "yogurt", "Греческий йогурт", "Penny", 1.69, 500],
    ["price-yogurt-netto", "yogurt", "Греческий йогурт", "Netto", 1.79, 500],
    ["price-yogurt-rewe", "yogurt", "Греческий йогурт", "Rewe", 1.99, 500],
    ["price-yogurt-edeka", "yogurt", "Греческий йогурт", "Edeka", 2.09, 500],
    ["price-yogurt-alnatura", "yogurt", "Греческий йогурт", "Alnatura", 2.79, 500],
    ["price-milk-aldi", "milk", "Молоко 3.5%", "Aldi Nord", 1.09, 1000],
    ["price-milk-lidl", "milk", "Молоко 3.5%", "Lidl", 1.09, 1000],
    ["price-milk-penny", "milk", "Молоко 3.5%", "Penny", 1.15, 1000],
    ["price-milk-netto", "milk", "Молоко 3.5%", "Netto", 1.19, 1000],
    ["price-milk-kaufland", "milk", "Молоко 3.5%", "Kaufland", 1.19, 1000],
    ["price-milk-rewe", "milk", "Молоко 3.5%", "Rewe", 1.29, 1000],
    ["price-milk-edeka", "milk", "Молоко 3.5%", "Edeka", 1.39, 1000],
    ["price-eggs-aldi", "eggs", "Яйца, 10 шт", "Aldi Nord", 2.19, 550],
    ["price-eggs-lidl", "eggs", "Яйца, 10 шт", "Lidl", 2.29, 550],
    ["price-eggs-penny", "eggs", "Яйца, 10 шт", "Penny", 2.39, 550],
    ["price-eggs-netto", "eggs", "Яйца, 10 шт", "Netto", 2.45, 550],
    ["price-eggs-kaufland", "eggs", "Яйца, 10 шт", "Kaufland", 2.49, 550],
    ["price-eggs-rewe", "eggs", "Яйца, 10 шт", "Rewe", 2.69, 550],
    ["price-eggs-edeka", "eggs", "Яйца, 10 шт", "Edeka", 2.79, 550],
    ["price-apple-aldi", "apple", "Яблоки, 1 кг", "Aldi Nord", 1.79, 1000],
    ["price-apple-lidl", "apple", "Яблоки, 1 кг", "Lidl", 1.89, 1000],
    ["price-apple-penny", "apple", "Яблоки, 1 кг", "Penny", 1.99, 1000],
    ["price-apple-netto", "apple", "Яблоки, 1 кг", "Netto", 2.09, 1000],
    ["price-apple-kaufland", "apple", "Яблоки, 1 кг", "Kaufland", 2.19, 1000],
    ["price-apple-rewe", "apple", "Яблоки, 1 кг", "Rewe", 2.49, 1000],
    ["price-apple-edeka", "apple", "Яблоки, 1 кг", "Edeka", 2.79, 1000],
    ["price-apple-alnatura", "apple", "Яблоки, 1 кг", "Alnatura", 3.49, 1000],
];

/** Демо-цены Гамбурга. Отдельная фабрика нужна ещё и миграции: старые
 *  сохранения с московским демо переезжают на немецкий рынок. */
export const createHamburgPrices = (date = dateKey()): PriceEntry[] =>
  PRICE_SHEET.map(([id, productId, productName, store, packagePrice, packageSizeG]) => ({
    id,
    productId,
    productName,
    store,
    city: "Гамбург",
    currency: "EUR",
    packagePrice,
    packageSizeG,
    date,
  }));

export const createDemoState = (): AppState => {
  const meals: MealEntry[] = [];
  const weights: WeightEntry[] = [];
  const alcohol: AlcoholEntry[] = [];
  const today = new Date();
  for (let index = 13; index >= 0; index -= 1) {
    const date = daysAgoKey(index);
    meals.push(makeEntry(date, "breakfast", BASE_FOODS[0]!, 80), makeEntry(date, "breakfast", BASE_FOODS[1]!, 250), makeEntry(date, "breakfast", BASE_FOODS[2]!, 120), makeEntry(date, "lunch", BASE_FOODS[3]!, 180), makeEntry(date, "lunch", BASE_FOODS[4]!, 250), makeEntry(date, "lunch", BASE_FOODS[5]!, 120), makeEntry(date, "lunch", BASE_FOODS[6]!, 10), makeEntry(date, "dinner", BASE_FOODS[7]!, 180), makeEntry(date, "dinner", BASE_FOODS[8]!, 300), makeEntry(date, "dinner", BASE_FOODS[9]!, 150), makeEntry(date, "snack", BASE_FOODS[10]!, 40), makeEntry(date, "snack", BASE_FOODS[11]!, 150), makeEntry(date, "snack", BASE_FOODS[15]!, 50));
    if (index === 8) meals.push(makeEntry(date, "snack", BASE_FOODS[16]!, 120, { junkFood: true }));
    if (index === 2) alcohol.push({ id: `${date}-wine`, date, name: "Красное вино 0,2 л", volumeMl: 200, abv: 13, calories: Math.round(calculateAlcoholCalories(200, 13)) });
    if (index === 9) alcohol.push({ id: `${date}-beer`, date, name: "Astra Pils 0,5 л", volumeMl: 500, abv: 4.9, calories: Math.round(calculateAlcoholCalories(500, 4.9)) });
    if (index === 11) alcohol.push({ id: `${date}-wine`, date, name: "Красное вино 0,2 л", volumeMl: 200, abv: 13, calories: Math.round(calculateAlcoholCalories(200, 13)) });
    weights.push({ id: `weight-${date}`, date, weightKg: Math.round((78 + Math.sin(index / 3) * 0.15 + (index % 3) * 0.05) * 10) / 10 });
  }
  const prices: PriceEntry[] = createHamburgPrices(dateKey(today));
  const presets: MealPreset[] = [{ id: "preset-breakfast", name: "Быстрый белковый завтрак", meal: "breakfast", entries: [{ foodId: "oats", name: "Овсянка", amountG: 80, ...scaleNutrition(380, 13, 7, 62, 1, 80), source: "database", junkFood: false }, { foodId: "whey", name: "Сывороточный протеин", amountG: 30, ...scaleNutrition(390, 78, 5, 7, 3, 30), source: "database", junkFood: false }] }];
  return { version: 1, profile: makeProfile(), foods: BASE_FOODS, customFoods: [], meals, presets, alcohol, weights, prices, recipes: RECIPES, programs: PROGRAMS, workoutLogs: [{ id: "log-demo", date: daysAgoKey(1), programId: "program-ppl", programName: "PPL — гипертрофия", sets: Array.from({ length: 4 }, (_, index) => ({ id: `set-${index}`, exercise: "Жим лёжа", weightKg: 70, reps: 8, rpe: 8 })) }], adjustments: [] };
};

export const createEmptyState = (): AppState => ({ version: 1, profile: { ...makeProfile(), completed: false, weightKg: 70, heightCm: 170, goal: "maintain", calorieAdjustment: 0, proteinGPerKg: 1.8, activityHours: { lying: 8, sitting: 10, standing: 5, training: 1 }, steps: 0 }, foods: BASE_FOODS, customFoods: [], meals: [], presets: [], alcohol: [], weights: [], prices: [], recipes: RECIPES, programs: PROGRAMS, workoutLogs: [], adjustments: [] });
