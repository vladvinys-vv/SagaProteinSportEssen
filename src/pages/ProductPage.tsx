import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useProduct } from "@/features/catalog";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { product, loading, error } = useProduct(slug || "");

  if (loading) {
    return <div className="text-center py-12">{t("products.loading", "Lädt...")}</div>;
  }

  if (error || !product) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{t("products.not_found", "Produkt nicht gefunden")}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Images */}
      <div>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full rounded-lg shadow-lg"
        />
      </div>

      {/* Details */}
      <div>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.shortDescription}</p>
        <div className="text-2xl font-bold text-brand-700 mb-4">
          {(product.price / 100).toFixed(2)} €
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {product.stockStatus === "in-stock"
            ? t("products.in_stock")
            : t("products.out_of_stock")}
        </p>
        <button
          className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors"
          onClick={() =>
            document.dispatchEvent(
              new CustomEvent("open-cart-drawer", {
                detail: { product },
              })
            )
          }
        >
          {t("products.add_to_cart", "In den Warenkorb")}
        </button>
      </div>
    </div>
  );
}
