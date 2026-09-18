import { useState } from "react";
import { ArrowRight, Check, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useCart } from "@/features/cart";
import { formatCurrency } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

const knownCategories = ["whey", "plant", "casein", "amino", "bar", "mass"];

export default function ProductCard({ product }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const availableVariant =
    product.variants.find((variant) => variant.inStock) || product.variants[0];
  const category = product.categories.find((item) => knownCategories.includes(item));
  const categoryLabel = category
    ? t(`products.category.${category}`, category)
    : product.categories[0] || t("products.title");
  const badge = product.newProduct
    ? t("home.new_products", "Neu")
    : product.bestseller
      ? t("home.best_sellers", "Bestseller")
      : undefined;

  const handleAdd = () => {
    if (!availableVariant) return;
    addItem(product, availableVariant);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden bg-brand-50">
        <ProductImage product={product} />
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-700 shadow-sm">
            {badge}
          </span>
        )}
        {!availableVariant?.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-gray-900/80 py-2 text-center text-xs font-bold text-white">
            {t("products.out_of_stock", "Nicht vorrätig")}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" aria-hidden="true" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <Link to={`/products/${product.slug}`} className="mb-2 group-hover:text-brand-700">
          <h3 className="text-lg font-bold leading-snug">{product.name}</h3>
        </Link>
        <p className="mb-5 text-sm leading-relaxed text-gray-600">{product.shortDescription}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div>
            <span className="block text-xl font-black text-brand-700">
              {formatCurrency(availableVariant?.price || product.price, i18n.language)}
            </span>
            {product.variants.length > 1 && (
              <span className="text-xs text-gray-500">{product.variants.length} Varianten</span>
            )}
          </div>

          {availableVariant ? (
            <button
              type="button"
              onClick={handleAdd}
              disabled={added}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-brand-700 text-white hover:bg-brand-800"
              }`}
              aria-label={`${t("products.add_to_cart", "In den Warenkorb")}: ${product.name}`}
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              {added ? t("cart.added", "Hinzugefügt") : t("products.add_short", "In Warenkorb")}
            </button>
          ) : (
            <Link
              to={`/products/${product.slug}`}
              className="flex items-center gap-2 rounded-xl bg-gray-200 px-3 py-2.5 text-sm font-bold text-gray-600"
            >
              {t("products.details", "Details")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
