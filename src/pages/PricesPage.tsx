import { DollarSign, Plus, ShoppingBasket, Store, Tag, Trash2, TrendingDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, EmptyState, SectionHeader } from "@/components/UI";
import { useFocusSection } from "@/hooks/useFocusSection";
import { dateKey, getNormalizedPrice } from "@/lib/calculations";
import { getDominantCurrency, getPriceComparisons, getShoppingSavings, getStoreRankings } from "@/lib/insights";
import { plural } from "@/lib/plural";
import { useAppState } from "@/state/AppContext";
import type { Currency, Food, PriceCategory, PriceEntry } from "@/types";

/** Евро показываем в немецком формате (1.234,56 €), остальные валюты — по-русски. */
const money = (value: number, currency: Currency) =>
  new Intl.NumberFormat(currency === "EUR" ? "de-DE" : "ru-RU", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

/** Сети Гамбурга — подсказки, чтобы наблюдение вводилось в один тап. */
export const STORE_HINTS = [
  "Aldi Nord",
  "Lidl",
  "Penny",
  "Netto",
  "Kaufland",
  "Rewe",
  "Edeka",
  "Alnatura",
  "denn's Biomarkt",
  "Fischmarkt",
  "dm",
  "Budni",
  "Myprotein",
];

const HOME_CITY = "Гамбург";

const categoryLabel: Record<PriceCategory, string> = { budget: "выгодно", medium: "средняя цена", premium: "изысканно" };

export default function PricesPage() {
  const { state, updateState } = useAppState();
  useFocusSection();

  const foods = useMemo(() => {
    const byId = new Map<string, Food>(state.foods.map((food) => [food.id, food]));
    state.customFoods.forEach((food) => {
      byId.set(food.id, food);
    });
    return [...byId.values()];
  }, [state.customFoods, state.foods]);

  const [draft, setDraft] = useState<PriceEntry>({
    id: "",
    productName: "",
    store: "",
    city: HOME_CITY,
    currency: state.profile.currency,
    packagePrice: 0,
    date: dateKey(),
  });
  const [sort, setSort] = useState<"cheap" | "premium" | "newest">("cheap");

  const comparisons = useMemo(() => getPriceComparisons(state.prices), [state.prices]);
  const rankings = useMemo(() => getStoreRankings(state.prices), [state.prices]);
  const savings = getShoppingSavings(state.prices);
  const currency = getDominantCurrency(state.prices);

  const sortedObservations = useMemo(
    () =>
      [...state.prices].sort((a, b) => {
        if (sort === "newest") return b.date.localeCompare(a.date);
        if (a.currency !== b.currency) return a.currency.localeCompare(b.currency);
        const difference = getNormalizedPrice(a) - getNormalizedPrice(b);
        return sort === "premium" ? -difference : difference;
      }),
    [state.prices, sort],
  );

  const addObservation = () => {
    const packageSize = draft.packageSizeG ?? draft.packageSizeMl;
    if (!draft.productName.trim() || !draft.store.trim() || !draft.city.trim() || draft.packagePrice <= 0 || !packageSize || packageSize <= 0) return;
    const matchingFood = foods.find((food) => food.name.toLowerCase() === draft.productName.trim().toLowerCase());
    updateState({
      prices: [
        {
          ...draft,
          id: `price-${Date.now()}`,
          productId: matchingFood?.id,
          productName: draft.productName.trim(),
          store: draft.store.trim(),
          city: draft.city.trim(),
        },
        ...state.prices,
      ],
    });
    setDraft({ id: "", productName: "", store: "", city: draft.city, currency: draft.currency, packagePrice: 0, date: dateKey() });
  };

  const bestStore = rankings[0];
  const fanciestStore = [...rankings].sort((a, b) => b.averageIndex - a.averageIndex)[0];

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Закупка</span>
          <h1>Где дешевле, а где изысканнее</h1>
          <p>
            Гамбург: сравнивай цены за 100 г между сетями — видно, где брать базовую корзину
            (Aldi Nord, Lidl, Penny, Netto), а где позволить себе премиум (Alnatura, denn's Biomarkt, Fischmarkt).
          </p>
        </div>
        <div className="title-stat">
          <Store size={17} />
          <span>
            Лучший магазин<strong>{bestStore?.store ?? "—"}</strong>
          </span>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card">
          <span className="summary-icon"><ShoppingBasket size={17} /></span>
          <span>Продуктов в наблюдении</span>
          <strong>{savings.products}</strong>
          <small>{plural(state.prices.length, "запись", "записи", "записей")} по {plural(new Set(state.prices.map((entry) => entry.store)).size, "магазину", "магазинам", "магазинам")}</small>
        </Card>
        <Card className="summary-card protein-summary">
          <span className="summary-icon"><TrendingDown size={17} /></span>
          <span>Экономия на упаковках</span>
          <strong>{money(savings.savings, currency)}</strong>
          <small>если брать каждый продукт по лучшей цене</small>
        </Card>
        <Card className="summary-card">
          <span className="summary-icon"><Store size={17} /></span>
          <span>Чаще всего выгоднее</span>
          <strong>{bestStore?.store ?? "—"}</strong>
          <small>{bestStore ? `${plural(bestStore.wins, "победа", "победы", "побед")} · индекс ${bestStore.averageIndex} %` : "нет данных"}</small>
        </Card>
        <Card className="summary-card">
          <span className="summary-icon"><DollarSign size={17} /></span>
          <span>Изысканнее всего</span>
          <strong>{fanciestStore?.store ?? "—"}</strong>
          <small>{fanciestStore ? `в среднем +${fanciestStore.averageIndex - 100} % к лучшей цене` : "нет данных"}</small>
        </Card>
      </div>

      <Card>
        <SectionHeader eyebrow="Сравнение" title="Цены по магазинам" action={<span className="day-result">за 100 г / 100 мл</span>} />
        {comparisons.length === 0 && <EmptyState title="Пока нет наблюдений" text="Добавь первую цену — и здесь появится сравнение магазинов." />}
        <div className="comparison-list">
          {comparisons.map((comparison) => (
            <article className="comparison-row" key={comparison.key}>
              <div className="comparison-head">
                <div>
                  <strong>{comparison.productName}</strong>
                  <small>
                    {plural(comparison.offers.length, "магазин", "магазина", "магазинов")} · разброс {comparison.spreadPercent} % · экономия {money(comparison.savings, currency)}
                  </small>
                </div>
                <span className={`price-category-label ${comparison.spreadPercent >= 50 ? "is-wide" : ""}`}>
                  {comparison.spreadPercent >= 50 ? "есть смысл искать" : "цены близко"}
                </span>
              </div>
              <div className="comparison-offers">
                <div className="offer is-cheapest">
                  <span>{categoryLabel.budget}</span>
                  <strong>{comparison.cheapest.store}</strong>
                  <small>
                    {money(comparison.cheapest.normalizedPrice, comparison.cheapest.currency)} / 100 {comparison.unit}
                  </small>
                </div>
                <div className="offer">
                  <span>средняя</span>
                  <strong>{money(comparison.average, comparison.cheapest.currency)}</strong>
                  <small>по {plural(comparison.offers.length, "наблюдению", "наблюдениям", "наблюдениям")}</small>
                </div>
                <div className="offer is-priciest">
                  <span>{categoryLabel.premium}</span>
                  <strong>{comparison.priciest.store}</strong>
                  <small>
                    {money(comparison.priciest.normalizedPrice, comparison.priciest.currency)} / 100 {comparison.unit}
                  </small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Card>

      <div className="two-column">
        <Card>
          <SectionHeader eyebrow="Рейтинг" title="Магазины по кошельку" />
          <div className="store-list">
            {rankings.length === 0 && <EmptyState title="Рейтинг пуст" text="Добавь цены хотя бы из двух магазинов." />}
            {rankings.map((ranking, index) => (
              <div className="store-row" key={ranking.store}>
                <span className="store-rank">{index + 1}</span>
                <div>
                  <strong>{ranking.store}</strong>
                  <small>
                    {ranking.city} · {ranking.wins} из {plural(comparisons.length, "победы", "побед", "побед")}
                  </small>
                </div>
                <span className={ranking.averageIndex <= 105 ? "index-tag is-good" : ranking.averageIndex >= 130 ? "index-tag is-bad" : "index-tag"}>
                  {ranking.averageIndex} %
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card id="new-price">
          <SectionHeader eyebrow="Наблюдение" title="Добавить цену" />
          <div className="price-form-grid">
            <label>
              <span>Продукт</span>
              <input value={draft.productName} onChange={(event) => setDraft({ ...draft, productName: event.target.value })} placeholder="Например, Куриная грудка" />
            </label>
            <label>
              <span>Магазин</span>
              <input
                list="store-hints"
                value={draft.store}
                onChange={(event) => setDraft({ ...draft, store: event.target.value })}
                placeholder="Aldi Nord, Rewe, Edeka…"
              />
              <datalist id="store-hints">
                {STORE_HINTS.map((store) => <option key={store} value={store} />)}
              </datalist>
            </label>
            <label>
              <span>Город</span>
              <input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} placeholder="Гамбург" />
            </label>
            <label>
              <span>Цена за упаковку</span>
              <input type="number" min="0" value={draft.packagePrice} onChange={(event) => setDraft({ ...draft, packagePrice: Number(event.target.value) })} />
            </label>
            <label>
              <span>Вес, г</span>
              <input
                type="number"
                min="0"
                value={draft.packageSizeG ?? ""}
                onChange={(event) => setDraft({ ...draft, packageSizeG: Number(event.target.value) || undefined, packageSizeMl: undefined })}
              />
            </label>
            <label>
              <span>Объём, мл</span>
              <input
                type="number"
                min="0"
                value={draft.packageSizeMl ?? ""}
                onChange={(event) => setDraft({ ...draft, packageSizeMl: Number(event.target.value) || undefined, packageSizeG: undefined })}
              />
            </label>
            <label>
              <span>Валюта</span>
              <select value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.target.value as Currency })}>
                <option value="EUR">Евро (€)</option>
                <option value="RUB">Рубли (₽)</option>
                <option value="USD">Доллары ($)</option>
              </select>
            </label>
            <button className="button secondary" type="button" onClick={addObservation}>
              <Plus size={16} /> Добавить цену
            </button>
          </div>

          <div className="sort-control">
            <button type="button" className={sort === "cheap" ? "is-active" : undefined} onClick={() => setSort("cheap")}>Дешевле всего</button>
            <button type="button" className={sort === "premium" ? "is-active" : undefined} onClick={() => setSort("premium")}>Премиальнее</button>
            <button type="button" className={sort === "newest" ? "is-active" : undefined} onClick={() => setSort("newest")}>Сначала новые</button>
          </div>
          <div className="price-list">
            {sortedObservations.map((entry) => (
              <div className="price-row" key={entry.id}>
                <div>
                  <strong>
                    {entry.productName} <small>{money(getNormalizedPrice(entry), entry.currency)} / 100 {entry.packageSizeG ? "г" : "мл"}</small>
                  </strong>
                  <small>
                    {entry.store} · {entry.city} · {entry.date}
                  </small>
                </div>
                <button
                  className="icon-button danger"
                  type="button"
                  aria-label={`Удалить цену ${entry.productName} в ${entry.store}`}
                  onClick={() => updateState({ prices: state.prices.filter((item) => item.id !== entry.id) })}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="capability-note">
          <Tag size={16} />
          <span>
            Цены вводятся вручную (ориентир — немецкий рынок, упаковка в евро): приложение не ходит в интернет
            за прайсами, поэтому сравнение остаётся полностью локальным и не устаревает на чужих данных.
          </span>
        </div>
      </Card>
    </div>
  );
}
