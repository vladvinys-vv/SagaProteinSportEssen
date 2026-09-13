import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero section */}
      <section className="relative bg-gradient-to-r from-brand-700 to-brand-800 text-white rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("home.hero_title")}
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              {t("home.hero_subtitle")}
            </p>
            <Link
              to="/products"
              className="inline-block bg-accent-gold text-brand-900 font-bold py-3 px-6 rounded-lg hover:bg-accent-gold-hover transition-colors"
            >
              {t("home.shop_now")}
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "free_shipping", icon: "🚚" },
            { key: "fast_delivery", icon: "⚡" },
            { key: "quality", icon: "✓" },
            { key: "support", icon: "📧" },
          ].map((badge) => (
            <div
              key={badge.key}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-sm font-medium">
                {t(`home.trust_badges.${badge.key}`)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories preview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{t("home.shop_by_category")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: "whey", label: t("products.category.whey"), color: "bg-blue-500" },
            { id: "plant", label: t("products.category.plant"), color: "bg-green-500" },
            { id: "casein", label: t("products.category.casein"), color: "bg-purple-500" },
            { id: "bar", label: t("products.category.bar"), color: "bg-orange-500" },
          ].map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="group relative h-32 rounded-lg overflow-hidden"
            >
              <div
                className={`absolute inset-0 ${cat.color} opacity-20 group-hover:opacity-30 transition-opacity`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-center px-4">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Placeholder for featured products */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{t("home.best_sellers")}</h2>
        <div className="text-center py-12 text-gray-500">
          <p>Featured products will be loaded here</p>
        </div>
      </section>
    </>
  );
}
