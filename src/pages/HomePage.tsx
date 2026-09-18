import { ArrowRight, Leaf, ShieldCheck, Truck, Zap } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/features/catalog";

const trustBadges = [
  { key: "free_shipping", icon: Truck },
  { key: "fast_delivery", icon: Zap },
  { key: "quality", icon: ShieldCheck },
  { key: "support", icon: Leaf },
] as const;

const categories = [
  { id: "whey", labelKey: "products.category.whey", color: "from-blue-500 to-blue-700" },
  { id: "plant", labelKey: "products.category.plant", color: "from-green-500 to-emerald-700" },
  { id: "casein", labelKey: "products.category.casein", color: "from-purple-500 to-violet-700" },
  { id: "bar", labelKey: "products.category.bar", color: "from-orange-500 to-red-600" },
] as const;

export default function HomePage() {
  const { t } = useTranslation();
  const { products, loading } = useProducts();
  const featuredProducts = products.filter((product) => product.featured || product.bestseller).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white shadow-xl">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 right-1/3 h-80 w-80 rounded-full bg-accent-gold/20 blur-3xl" aria-hidden="true" />
        <div className="relative container mx-auto grid min-h-[32rem] items-center px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-black uppercase tracking-[0.28em] text-accent-gold">Made in Germany</p>
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
              {t("home.hero_title")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
              {t("home.hero_subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-accent-gold px-6 py-3.5 rounded-xl text-brand-900 font-black shadow-lg shadow-brand-950/20 transition hover:-translate-y-0.5 hover:bg-accent-gold-hover"
              >
                {t("home.shop_now")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
              >
                {t("nav.about")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label={t("home.trust_title", "Deine Vorteile")}>
        {trustBadges.map(({ key, icon: Icon }) => (
          <div key={key} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold leading-snug">{t(`home.trust_badges.${key}`)}</span>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-brand-600">{t("home.featured_label", "Beliebt bei Athleten")}</p>
            <h2 className="text-3xl font-black md:text-4xl">{t("home.best_sellers")}</h2>
          </div>
          <Link to="/products" className="hidden items-center gap-2 text-sm font-bold text-brand-700 hover:underline sm:inline-flex">
            {t("home.view_all", "Alle Produkte")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4">
                <div className="aspect-square rounded-xl bg-gray-200" />
                <div className="mt-4 h-5 w-3/4 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            {t("products.loading", "Lädt...")}
          </div>
        )}
      </section>

      <section className="mt-14">
        <div className="mb-6">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-brand-600">{t("home.category_label", "Finde Dein Produkt")}</p>
          <h2 className="text-3xl font-black md:text-4xl">{t("home.shop_by_category")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className={`group relative isolate flex min-h-36 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${category.color} p-5 text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl`}
            >
              <span className="absolute inset-0 -z-10 bg-gray-950/10 transition group-hover:bg-gray-950/20" />
              <ArrowRight className="h-5 w-5 translate-x-2 opacity-60 transition group-hover:translate-x-0 group-hover:opacity-100" />
              <span className="text-lg font-black leading-tight">{t(category.labelKey)}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
