import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/features/cart";
import { useProducts } from "@/features/catalog";
import type { Product } from "@/types";

const categories = [
  { id: "all", key: "all" },
  { id: "whey", key: "whey" },
  { id: "plant", key: "plant" },
  { id: "casein", key: "casein" },
  { id: "amino", key: "amino" },
  { id: "bar", key: "bar" },
] as const;

type SortOption = "featured" | "price-low" | "price-high" | "rating" | "newest";

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { t } = useTranslation();
  const primaryVariant =
    product.variants.find((variant) => variant.inStock) ?? product.variants[0];
  const price = primaryVariant?.price ?? product.price;
  const isOut = product.stockStatus === "out-of-stock" || !primaryVariant;

  return (
    <article className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-100 via-brand-50 to-accent-gold/30 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.9),transparent_28%)]" />
          <div className="relative text-center px-5">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              {product.brand}
            </span>
            <span className="mt-3 block text-5xl font-black text-brand-800">
              {product.name.charAt(0)}
            </span>
          </div>
          {product.bestseller && (
            <span className="absolute left-3 top-3 rounded-full bg-brand-700 px-3 py-1 text-xs font-bold text-white">
              Bestseller
            </span>
          )}
          {product.newProduct && (
            <span className="absolute left-3 top-3 rounded-full bg-accent-gold px-3 py-1 text-xs font-bold text-brand-900">
              New
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-1 text-sm text-amber-500">
            <Star className="h-4 w-4 fill-current" aria-hidden="true" />
            <span className="font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-gray-400">({product.reviewCount.toLocaleString()})</span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-gray-900 group-hover:text-brand-700">
            {product.name}
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-500">{product.shortDescription}</p>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
        <div>
          <span className="block text-xs text-gray-400">
            {primaryVariant?.name ?? t("products.unavailable", "Nicht verfügbar")}
          </span>
          <span className="text-lg font-bold text-brand-700">{(price / 100).toFixed(2)} €</span>
        </div>
        <button
          type="button"
          disabled={isOut}
          onClick={() => {
            if (primaryVariant) {
              addItem(product, primaryVariant);
              document.dispatchEvent(new CustomEvent("open-cart-drawer"));
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          aria-label={`${t("products.add_to_cart", "In den Warenkorb")}: ${product.name}`}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {isOut ? t("products.out_of_stock", "Nicht vorrätig") : t("products.add_short", "In den Korb")}
        </button>
      </div>
    </article>
  );
}

export default function CatalogPage() {
  const { products, loading } = useProducts();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState<SortOption>("featured");
  const [query, setQuery] = useState("");
  const selectedCategory = searchParams.get("category") ?? "all";

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("de");
    const result = products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.categories.includes(selectedCategory);
      const matchesQuery =
        !normalizedQuery ||
        [product.name, product.shortDescription, product.brand, ...product.tags]
          .join(" ")
          .toLocaleLowerCase("de")
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });

    return result.sort((a, b) => {
      const aPrice = a.variants.find((variant) => variant.inStock)?.price ?? a.price;
      const bPrice = b.variants.find((variant) => variant.inStock)?.price ?? b.price;
      if (sort === "price-low") return aPrice - bPrice;
      if (sort === "price-high") return bPrice - aPrice;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "newest") return Number(b.newProduct) - Number(a.newProduct);
      return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    });
  }, [products, query, selectedCategory, sort]);

  const selectCategory = (category: string) => {
    if (category === "all") {
      setSearchParams({});
      return;
    }
    setSearchParams({ category });
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">SAGA Collection</p>
        <h1 className="mt-2 text-4xl font-black text-gray-900">{t("products.title")}</h1>
        <p className="mt-3 max-w-2xl text-gray-500">
          {t("products.subtitle", "Hochwertige Sportnahrung, entwickelt für konsequentes Training.")}
        </p>
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="product-search">
            {t("products.search", "Produkte durchsuchen")}
          </label>
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("products.search_placeholder", "Produkt oder Ziel suchen")}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none ring-brand-200 focus:ring-2"
          />
          <label className="sr-only" htmlFor="product-sort">
            {t("products.sort_by")}
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none ring-brand-200 focus:ring-2"
          >
            <option value="featured">{t("products.sort.featured")}</option>
            <option value="price-low">{t("products.sort.price_low")}</option>
            <option value="price-high">{t("products.sort.price_high")}</option>
            <option value="rating">{t("products.sort.rating")}</option>
            <option value="newest">{t("products.sort.newest")}</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2" aria-label={t("products.filter")}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => selectCategory(category.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                selectedCategory === category.id
                  ? "bg-brand-700 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700"
              }`}
              aria-pressed={selectedCategory === category.id}
            >
              {category.key === "all"
                ? t("products.all", "Alle")
                : t(`products.category.${category.key}`)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-gray-500" aria-live="polite">
            {filteredProducts.length}{" "}
            {t("products.results", { count: filteredProducts.length })}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-lg font-bold text-gray-700">{t("products.no_results", "Keine Produkte gefunden")}</p>
          <p className="mt-2 text-gray-500">{t("products.no_results_hint", "Passe Filter oder Suchbegriff an.")}</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              selectCategory("all");
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            {t("products.reset_filters", "Filter zurücksetzen")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
