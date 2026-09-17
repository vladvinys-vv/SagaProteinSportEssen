import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Check, Minus, Plus, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { useCart } from "@/features/cart";
import { useProduct } from "@/features/catalog";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug || "");
  const { addItem } = useCart();
  const { t } = useTranslation();
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const variants = product?.variants ?? [];
  const selectedVariant = useMemo(
    () =>
      variants.find((variant) => variant.id === variantId) ??
      variants.find((variant) => variant.inStock) ??
      variants[0],
    [variantId, variants],
  );

  if (loading) {
    return (
      <div className="grid place-items-center py-24" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <span className="sr-only">{t("products.loading", "Lädt...")}</span>
      </div>
    );
  }

  if (error || !product || !selectedVariant) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 py-24 text-center">
        <p className="text-lg font-bold text-gray-700">{t("products.not_found", "Produkt nicht gefunden")}</p>
        <p className="mt-2 text-gray-500">{t("products.not_found_hint", "Dieses Produkt ist nicht mehr verfügbar.")}</p>
      </div>
    );
  }

  const price = selectedVariant.price;
  const isInStock = selectedVariant.inStock;
  const addToCart = () => {
    if (!isInStock) return;
    addItem(product, selectedVariant, quantity);
    document.dispatchEvent(new CustomEvent("open-cart-drawer"));
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 via-brand-50 to-accent-gold/30 aspect-square lg:aspect-auto lg:min-h-[560px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.9),transparent_28%)]" />
        <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
            {product.brand}
          </span>
          <span className="mt-6 text-[9rem] font-black leading-none text-brand-800">
            {product.name.charAt(0)}
          </span>
          <span className="mt-6 max-w-md text-lg font-bold text-brand-900">{product.name}</span>
        </div>
        <div className="absolute bottom-5 left-5 flex gap-2">
          {product.images.map((image, index) => (
            <span
              key={image}
              className="h-2 w-8 rounded-full bg-brand-300"
              aria-hidden={index !== 0}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          {product.bestseller && (
            <span className="rounded-full bg-brand-700 px-3 py-1 text-xs font-bold text-white">
              Bestseller
            </span>
          )}
          {product.newProduct && (
            <span className="rounded-full bg-accent-gold px-3 py-1 text-xs font-bold text-brand-900">
              New
            </span>
          )}
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
            {product.categories[0]}
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-black text-gray-900">{product.name}</h1>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-amber-500">
            <span className="font-black">★</span> {product.rating.toFixed(1)}
          </span>
          <span className="text-gray-400">{product.reviewCount.toLocaleString()} Bewertungen</span>
        </div>
        <p className="mt-5 text-lg leading-8 text-gray-600">{product.description}</p>

        <div className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm text-gray-500">{selectedVariant.name}</span>
              <div className="mt-1 text-4xl font-black text-brand-700">{(price / 100).toFixed(2)} €</div>
            </div>
            {isInStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700">
                <Check className="h-4 w-4" aria-hidden="true" />
                {t("products.in_stock")}
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-500">
                {t("products.out_of_stock")}
              </span>
            )}
          </div>

          <fieldset className="mt-6">
            <legend className="mb-2.5 text-sm font-bold text-gray-700">
              {t("products.variant", "Variante")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setVariantId(variant.id)}
                  disabled={!variant.inStock}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    selectedVariant?.id === variant.id
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
                  }`}
                  aria-pressed={selectedVariant?.id === variant.id}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-8 flex items-stretch gap-3">
          <div className="flex items-center rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="px-4 py-3 text-gray-600 hover:text-brand-700"
              aria-label={t("products.decrease_quantity", "Menge verringern")}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <output className="w-10 text-center font-bold" aria-label={t("products.quantity", "Menge")}>
              {quantity}
            </output>
            <button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              className="px-4 py-3 text-gray-600 hover:text-brand-700"
              aria-label={t("products.increase_quantity", "Menge erhöhen")}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={!isInStock}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {isInStock
              ? t("products.add_to_cart", "In den Warenkorb")
              : t("products.out_of_stock", "Nicht vorrätig")}
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
            <Truck className="mt-0.5 h-5 w-5 text-brand-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold">{t("products.delivery", "Schneller Versand")}</p>
              <p className="text-sm text-gray-500">{product.deliveryInfo}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold">{t("products.quality", "Geprüfte Qualität")}</p>
              <p className="text-sm text-gray-500">{t("products.quality_hint", "Hergestellt in Deutschland.")}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200">
          <details className="group p-5" open>
            <summary className="cursor-pointer list-none font-bold">{t("products.nutrition", "Nährwerte")}</summary>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {Object.entries(product.nutritionalInfo.perServing).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="capitalize text-gray-500">{key.replaceAll("_", " ")}</span>
                  <span className="font-bold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </details>
          <details className="border-t border-gray-200 p-5">
            <summary className="cursor-pointer list-none font-bold">{t("products.ingredients", "Zutaten")}</summary>
            <p className="mt-3 text-sm leading-6 text-gray-600">{product.ingredients.join(", ")}</p>
          </details>
        </div>
      </div>
    </div>
  );
}
