import { useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/features/cart";
import { useProduct } from "@/features/catalog";
import { formatCurrency } from "@/lib/format";
import { ProductVariant } from "@/types";

const categoryKeys = ["whey", "plant", "casein", "amino", "bar", "mass"];

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug || "");
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const firstAvailable = product?.variants.find((variant) => variant.inStock) || product?.variants[0];
    setSelectedVariantId(firstAvailable?.id);
    setQuantity(1);
    setAdded(false);
    setSelectedImageIndex(0);
  }, [product]);

  const selectedVariant = product?.variants.find((variant) => variant.id === selectedVariantId);
  const stockLabel = selectedVariant?.inStock
    ? product?.stockStatus === "low-stock"
      ? t("products.low_stock", "Fast ausverkauft")
      : t("products.in_stock", "Auf Lager")
    : t("products.out_of_stock", "Nicht vorrätig");

  const handleAdd = () => {
    if (!product || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    document.dispatchEvent(new CustomEvent("open-cart-drawer"));
    window.setTimeout(() => setAdded(false), 1800);
  };

  if (loading) {
    return (
      <div className="grid min-h-96 place-items-center">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
          <span className="font-semibold">{t("products.loading", "Lädt...")}</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center">
        <p className="text-xl font-bold">{t("products.not_found", "Produkt nicht gefunden")}</p>
        <Link to="/products" className="mt-4 text-brand-700 hover:underline">
          {t("products.back_to_catalog", "Zurück zum Sortiment")}
        </Link>
      </div>
    );
  }

  return (
    <section>
      <Link
        to="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("products.back_to_catalog", "Zurück zum Sortiment")}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <ProductImage
            product={product}
            src={product.images[selectedImageIndex]}
            className="aspect-square w-full rounded-2xl"
            priority
          />
          <div className="mt-4 flex gap-3">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                className={`h-16 w-16 overflow-hidden rounded-xl border-2 p-1 ${
                  index === 0 ? "border-brand-600" : "border-transparent bg-gray-50"
                }`}
                aria-label={`${t("products.image", "Bild")} ${index + 1}`}
              >
                <img src={image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {categoryKeys
              .filter((category) => product.categories.includes(category))
              .map((category) => (
                <Link
                  key={category}
                  to={`/products?category=${category}`}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100"
                >
                  {t(`products.category.${category}`, category)}
                </Link>
              ))}
          </div>

          <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm font-bold text-gray-800">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              {product.reviewCount.toLocaleString(i18n.language)} {t("products.reviews", "Bewertungen")}
            </span>
          </div>

          <p className="mt-6 text-lg leading-relaxed text-gray-700">{product.description}</p>

          <div className="mt-7 rounded-2xl bg-gray-50 p-5">
            <span className="text-sm text-gray-600">{t("products.selected_variant", "Ausgewählte Variante")}</span>
            <div className="mt-1 text-3xl font-black text-brand-700">
              {formatCurrency(selectedVariant?.price || product.price, i18n.language)}
            </div>
            {selectedVariant && (
              <div className="mt-2 text-sm text-gray-600">
                {selectedVariant.name} · {selectedVariant.flavor} · {selectedVariant.sku}
              </div>
            )}
          </div>

          {product.variants.length > 0 && (
            <fieldset className="mt-6">
              <legend className="mb-2.5 text-sm font-bold">{t("products.variant", "Variante")}</legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setQuantity(1);
                    }}
                    disabled={!variant.inStock}
                    className={`relative rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                      selectedVariantId === variant.id
                        ? "border-brand-700 bg-brand-50 shadow-sm"
                        : "border-gray-300 bg-white hover:border-brand-400"
                    }`}
                  >
                    <span className="block text-sm font-bold">{variant.name}</span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {formatCurrency(variant.price, i18n.language)}
                    </span>
                    {!variant.inStock && (
                      <span className="absolute right-2 top-2 text-[10px] font-black uppercase text-red-600">
                        {t("products.sold_out", "Ausverkauft")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-bold">{t("products.quantity", "Menge")}</span>
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-300">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                className="flex h-11 w-11 items-center justify-center text-brand-700 disabled:opacity-30"
                aria-label={t("products.decrease_quantity", "Menge verringern")}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => value + 1)}
                className="flex h-11 w-11 items-center justify-center text-brand-700"
                aria-label={t("products.increase_quantity", "Menge erhöhen")}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedVariant?.inStock || added}
              className={`flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-black transition ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-brand-700 text-white hover:bg-brand-800 disabled:bg-gray-300 disabled:text-gray-600"
              }`}
            >
              {added ? <Check className="h-5 w-5" /> : null}
              {added
                ? t("cart.added", "Hinzugefügt")
                : `${t("products.add_to_cart", "In den Warenkorb")} · ${formatCurrency(
                    (selectedVariant?.price || product.price) * quantity,
                    i18n.language
                  )}`}
            </button>
            <Link
              to="/cart"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-brand-700 px-6 py-4 text-base font-black text-brand-700 transition hover:bg-brand-50"
            >
              {t("cart.view", "Warenkorb ansehen")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="sr-only" aria-live="polite">
            {added ? t("cart.added", "Hinzugefügt") : ""}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">
              <Truck className="h-5 w-5 shrink-0" />
              {product.deliveryInfo}
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              {t("products.quality", "Geprüfte Qualität")}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-xl font-black">{t("products.nutrition", "Nährwerte")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-bold">{t("products.nutrient", "Nährstoff")}</th>
                  <th className="pb-3 font-bold">{t("products.per_serving", "Pro Portion")}</th>
                  <th className="pb-3 font-bold">{t("products.per_100g", "Pro 100 g")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(product.nutritionalInfo.perServing).map(([key, value]) => (
                  <tr key={key}>
                    <td className="py-3 capitalize text-gray-700">{key.replace(/([A-Z])/g, " $1")}</td>
                    <td className="py-3 font-semibold">{value}</td>
                    <td className="py-3 text-gray-600">{product.nutritionalInfo.per100g[key] || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {product.nutritionalInfo.warnings.length > 0 && (
            <p className="mt-4 text-xs leading-relaxed text-gray-500">
              {product.nutritionalInfo.warnings.join(" · ")}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-black">{t("products.ingredients", "Zutaten")}</h2>
          <p className="text-sm leading-relaxed text-gray-700">{product.ingredients.join(", ")}</p>
        </div>
      </div>
    </section>
  );
}
