import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/features/cart";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const { items, totalItems, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const { t, i18n } = useTranslation();
  const remainingForFreeShipping = Math.max(0, 4900 - subtotal);

  if (items.length === 0) {
    return (
      <section className="flex min-h-[32rem] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black md:text-3xl">{t("cart.title", "Warenkorb")}</h1>
        <p className="mt-3 max-w-md text-gray-600">{t("cart.empty", "Ihr Warenkorb ist leer")}</p>
        <Link
          to="/products"
          className="mt-6 rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white hover:bg-brand-800"
        >
          {t("home.shop_now", "Jetzt shoppen")}
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">{t("cart.heading", "Deine Bestellung")}</p>
          <h1 className="text-3xl font-black md:text-4xl">{t("cart.title", "Warenkorb")}</h1>
          <p className="mt-2 text-gray-600">{totalItems} {t("cart.items", "Artikel")}</p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          {t("cart.clear", "Warenkorb leeren")}
        </button>
      </div>

      {remainingForFreeShipping > 0 && (
        <div className="mb-6 rounded-2xl bg-brand-50 p-4 text-sm font-semibold text-brand-800">
          {t("cart.free_shipping_hint", "Noch")} {formatCurrency(remainingForFreeShipping, i18n.language)}{" "}
          {t("cart.to_free_shipping", "bis zum kostenlosen Versand")}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}:${item.variantId}`} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <ProductImage product={item.product} className="h-24 w-24 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{item.product.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.variant.name} · {item.variant.flavor} · {item.variant.sku}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`${t("cart.remove", "Entfernen")}: ${item.product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center overflow-hidden rounded-xl border border-gray-300">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="flex h-10 w-10 items-center justify-center text-brand-700"
                      aria-label={t("products.decrease_quantity", "Menge verringern")}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center text-brand-700"
                      aria-label={t("products.increase_quantity", "Menge erhöhen")}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-gray-500">{formatCurrency(item.variant.price, i18n.language)}</span>
                    <span className="text-lg font-black text-brand-700">
                      {formatCurrency(item.variant.price * item.quantity, i18n.language)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-lg font-black">{t("cart.order_summary", "Bestellübersicht")}</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{t("cart.subtotal", "Zwischensumme")}</span>
              <span className="font-semibold">{formatCurrency(subtotal, i18n.language)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t("checkout.shipping", "Versand")}</span>
              <span className="font-semibold">{subtotal >= 4900 ? t("checkout.free", "Kostenlos") : formatCurrency(490, i18n.language)}</span>
            </div>
            <div className="border-t pt-4 text-base font-bold">
              <div className="flex justify-between">
                <span>{t("cart.total", "Gesamt")}</span>
                <span className="font-black text-brand-700">
                  {formatCurrency(subtotal + (subtotal >= 4900 ? 0 : 490), i18n.language)}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-brand-800"
          >
            {t("cart.checkout", "Zur Kasse")}
          </Link>
          <Link to="/products" className="mt-3 block text-center text-sm font-bold text-brand-700 hover:underline">
            {t("cart.continue_shopping", "Weiter einkaufen")}
          </Link>
        </aside>
      </div>
    </section>
  );
}
