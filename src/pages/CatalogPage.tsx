import { useMemo } from "react";
import { ArrowRight, PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { Link } from "react-router";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/features/catalog";
import { Product } from "@/types";

const categoryKeys = ["whey", "plant", "casein", "amino", "bar", "mass"];

function sortProducts(products: Product[], sort: string) {
  return [...products].sort((a, b) => {
    const lowestPrice = (product: Product) =>
      Math.min(...product.variants.map((variant) => variant.price));

    if (sort === "price_low") return lowestPrice(a) - lowestPrice(b);
    if (sort === "price_high") return lowestPrice(b) - lowestPrice(a);
    if (sort === "rating") return b.rating - a.rating || b.reviewCount - a.reviewCount;
    if (sort === "newest") return Number(b.newProduct) - Number(a.newProduct);
    return Number(b.featured) - Number(a.featured) || Number(b.bestseller) - Number(a.bestseller);
  });
}

export default function CatalogPage() {
  const { t, i18n } = useTranslation();
  const { products, loading, error } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "featured";
  const inStockOnly = searchParams.get("availability") === "in-stock";

  const categories = useMemo(
    () => categoryKeys.filter((category) => products.some((product) => product.categories.includes(category))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(i18n.language);
    return sortProducts(
      products.filter((product) => {
        const matchesCategory = selectedCategory === "all" || product.categories.includes(selectedCategory);
        const matchesAvailability = !inStockOnly || product.variants.some((variant) => variant.inStock);
        const matchesQuery =
          normalizedQuery.length === 0 ||
          [product.name, product.shortDescription, product.brand, ...product.tags, ...product.categories]
            .join(" ")
            .toLocaleLowerCase(i18n.language)
            .includes(normalizedQuery);

        return matchesCategory && matchesAvailability && matchesQuery;
      }),
      sort
    );
  }, [inStockOnly, i18n.language, products, query, selectedCategory, sort]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "all" || value === "featured") next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const hasFilters = query || selectedCategory !== "all" || sort !== "featured" || inStockOnly;

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">SAGA SPORTNUTRITION</p>
          <h1 className="text-4xl font-black tracking-tight text-gray-950 md:text-5xl">{t("products.title")}</h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            {t("products.subtitle", "Hochwertige Proteine und Sportnahrung für jeden Trainingsplan.")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <SlidersHorizontal className="h-4 w-4" />
          {filteredProducts.length} {t("products.items", "Produkte")}
        </div>
      </div>

      <div className="mb-7 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_190px_190px] md:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-gray-500">{t("products.search", "Suchen")}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => updateParam("q", event.target.value)}
            placeholder={t("products.search_placeholder", "Produkt oder Ziel suchen")}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-gray-500">{t("products.filter", "Filtern")}</span>
          <select
            value={selectedCategory}
            onChange={(event) => updateParam("category", event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          >
            <option value="all">{t("products.all_categories", "Alle Kategorien")}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {t(`products.category.${category}`, category)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-gray-500">{t("products.sort_by", "Sortieren nach")}</span>
          <select
            value={sort}
            onChange={(event) => updateParam("sort", event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          >
            <option value="featured">{t("products.sort.featured", "Empfohlen")}</option>
            <option value="price_low">{t("products.sort.price_low", "Preis: niedrig zuerst")}</option>
            <option value="price_high">{t("products.sort.price_high", "Preis: hoch zuerst")}</option>
            <option value="rating">{t("products.sort.rating", "Bewertung")}</option>
            <option value="newest">{t("products.sort.newest", "Neuste")}</option>
          </select>
        </label>

        <label className="flex h-11 cursor-pointer items-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-brand-400">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => updateParam("availability", event.target.checked ? "in-stock" : "")}
            className="mr-2 h-4 w-4 accent-brand-600"
          />
          {t("products.in_stock_only", "Nur verfügbare")}
        </label>
      </div>

      {selectedCategory !== "all" && (
        <div className="mb-5 flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
            {t(`products.category.${selectedCategory}`, selectedCategory)}
          </span>
          <button
            type="button"
            onClick={() => updateParam("category", "all")}
            className="rounded-full p-1 text-brand-700 hover:bg-brand-50"
            aria-label={t("products.clear_filter", "Filter entfernen")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label={t("products.loading", "Lädt...")}>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4">
              <div className="aspect-square rounded-xl bg-gray-200" />
              <div className="mt-4 h-5 w-3/4 rounded bg-gray-200" />
              <div className="mt-3 h-4 w-full rounded bg-gray-200" />
              <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800">{error}</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <PackageSearch className="mb-4 h-12 w-12 text-brand-400" />
          <h2 className="text-xl font-bold">{t("products.no_results", "Keine Produkte gefunden")}</h2>
          <p className="mt-2 text-gray-600">{t("products.no_results_hint", "Passe Suche oder Filter an.")}</p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
            >
              {t("products.reset_filters", "Filter zurücksetzen")}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
