import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ArrowRight, BadgeCheck, Mail, Truck, Zap } from "lucide-react";
import { useCart } from "@/features/cart";
import { useProducts } from "@/features/catalog";

const trustBadges = [
  { key: "free_shipping", icon: Truck },
  { key: "fast_delivery", icon: Zap },
  { key: "quality", icon: BadgeCheck },
  { key: "support", icon: Mail },
] as const;

const categoryLinks = [
  { id: "whey", labelKey: "products.category.whey", color: "from-blue-500/20 to-blue-500/5" },
  { id: "plant", labelKey: "products.category.plant", color: "from-green-500/20 to-green-500/5" },
  { id: "casein", labelKey: "products.category.casein", color: "from-purple-500/20 to-purple-500/5" },
  { id: "bar", labelKey: "products.category.bar", color: "from-orange-500/20 to-orange-500/5" },
] as const;

export default function HomePage() {
  const { t } = useTranslation();
  const { products } = useProducts();
  const { addItem } = useCart();
  const featuredProducts = products
    .filter((product) => product.bestseller || product.featured)
    .slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-800 to-brand-900 text-white mb-8">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-gold/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-accent-gold">
              {t("home.eyebrow", "Premium Sportnahrung")}
            </p>
            <h1 className="text-4xl leading-tight md:text-6xl md:leading-[1.08] font-black mb-5">
              {t("home.hero_title")}
            </h1>
            <p className="text-lg leading-8 md:text-xl text-brand-100 mb-8">
              {t("home.hero_subtitle")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-accent-gold px-7 py-3.5 rounded-lg text-brand-900 font-bold hover:bg-accent-gold-hover transition-colors"
              >
                {t("home.shop_now")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-7 py-3.5 font-bold hover:bg-white/10 transition-colors"
              >
                {t("home.learn_more", "Mehr erfahren")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12" aria-label={t("home.trust_title", "Deine Vorteile")}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trustBadges.map(({ key, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold leading-5 text-gray-700">
                {t(`home.trust_badges.${key}`)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">{t("home.collection", "Kollektion")}</p>
            <h2 className="mt-2 text-3xl font-black text-gray-900">{t("home.shop_by_category")}</h2>
          </div>
          <Link to="/products" className="hidden text-sm font-bold text-brand-700 hover:underline sm:inline-flex items-center gap-1.5">
            {t("home.view_all", "Alle ansehen")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryLinks.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className={`group relative h-32 overflow-hidden rounded-xl bg-gradient-to-br ${category.color} border border-gray-100`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center transition-transform duration-200 group-hover:scale-105">
                <span className="text-2xl font-black text-brand-800">{category.id.charAt(0).toUpperCase()}</span>
                <span className="mt-2 text-sm font-bold text-gray-700">{t(category.labelKey)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">{t("home.customer_favorite", "Beliebt bei Athleten")}</p>
            <h2 className="mt-2 text-3xl font-black text-gray-900">{t("home.best_sellers")}</h2>
          </div>
          <Link to="/products" className="text-sm font-bold text-brand-700 hover:underline">
            {t("home.view_all", "Alle ansehen")}
          </Link>
        </div>
        {featuredProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => {
              const variant = product.variants.find((item) => item.inStock) ?? product.variants[0];
              return (
                <article key={product.id} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <Link to={`/products/${product.slug}`} className="group block">
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-100 via-brand-50 to-accent-gold/30 flex items-center justify-center">
                      <span className="text-6xl font-black text-brand-800">{product.name.charAt(0)}</span>
                      {product.bestseller && (
                        <span className="absolute left-3 top-3 rounded-full bg-brand-700 px-3 py-1 text-xs font-bold text-white">
                          Bestseller
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-1 text-sm text-amber-500">
                        <span aria-hidden="true">★</span>
                        <span className="font-bold">{product.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({product.reviewCount.toLocaleString()})</span>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-gray-900 group-hover:text-brand-700">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{product.shortDescription}</p>
                    </div>
                  </Link>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
                    <span className="text-lg font-black text-brand-700">{variant ? (variant.price / 100).toFixed(2) : "–"} €</span>
                    <button
                      type="button"
                      disabled={!variant}
                      onClick={() => {
                        if (variant) {
                          addItem(product, variant);
                          document.dispatchEvent(new CustomEvent("open-cart-drawer"));
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-200"
                    >
                      {t("products.add_short", "In den Korb")}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-500">
            {t("home.featured_loading", "Produkte werden geladen")}
          </div>
        )}
      </section>
    </>
  );
}
