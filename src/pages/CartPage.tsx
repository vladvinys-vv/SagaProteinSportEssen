import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/features/cart";

const getItemId = (productId: string, variantId: string) => `${productId}:${variantId}`;

export default function CartPage() {
  const { items, totalItems, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const { t } = useTranslation();
  const currency = (cents: number) => (cents / 100).toFixed(2);
  const freeShippingThreshold = 4900;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Your selection</p>
        <h1 className="mt-2 text-4xl font-black text-gray-900">{t("cart.title", "Warenkorb")}</h1>
        <p className="mt-3 text-gray-500">
          {totalItems > 0
            ? t("cart.subtitle", "Überprüfen Sie Ihre Auswahl, bevor Sie zur Kasse gehen.")
            : t("cart.empty_hint", "Entdecken Sie unsere Produkte und stellen Sie Ihren Warenkorb zusammen.")}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <ShoppingBag className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-gray-800">{t("cart.empty", "Ihr Warenkorb ist leer")}</h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            {t("cart.empty_description", "Ihre ausgewählten Produkte erscheinen hier.")}
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            {t("cart.browse", "Produkte entdecken")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-4">
            {items.map((item) => {
              const itemId = getItemId(item.productId, item.variantId);
              return (
                <article key={itemId} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-accent-gold/30 text-2xl font-black text-brand-700"
                    aria-label={item.product.name}
                  >
                    {item.product.name.charAt(0)}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/products/${item.product.slug}`}
                          className="font-bold text-gray-900 hover:text-brand-700"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">{item.variant.name}</p>
                        <p className="mt-1 text-xs text-gray-400">{item.variant.sku}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(itemId)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`${t("cart.remove", "Entfernen")}: ${item.product.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, item.quantity - 1)}
                          className="rounded-l-lg px-3 py-2 text-gray-600 hover:text-brand-700"
                          aria-label={t("cart.decrease", "Menge verringern")}
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, item.quantity + 1)}
                          className="rounded-r-lg px-3 py-2 text-gray-600 hover:text-brand-700"
                          aria-label={t("cart.increase", "Menge erhöhen")}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm text-gray-500">{currency(item.variant.price)} €</span>
                        <span className="block text-lg font-black text-brand-700">
                          {currency(item.variant.price * item.quantity)} €
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-bold text-gray-500 underline-offset-4 hover:text-red-600 hover:underline"
            >
              {t("cart.clear", "Warenkorb leeren")}
            </button>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-black">{t("cart.order_summary", "Zusammenfassung")}</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t("cart.subtotal", "Zwischensumme")}</span>
                <span className="font-bold">{currency(subtotal)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t("cart.shipping", "Versand")}</span>
                <span className="font-bold">
                  {subtotal >= freeShippingThreshold
                    ? t("cart.free", "Kostenlos")
                    : t("cart.calculated_at_checkout", "Im Checkout")}
                </span>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4 flex justify-between">
                <span className="font-black">{t("cart.total", "Gesamt")}</span>
                <span className="text-xl font-black text-brand-700">{currency(subtotal)} €</span>
              </div>
            </div>

            {remainingForFreeShipping > 0 ? (
              <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
                {t("cart.free_shipping_progress", "Noch {{amount}} € bis zum kostenlosen Versand.", {
                  amount: (remainingForFreeShipping / 100).toFixed(2),
                })}
              </p>
            ) : (
              <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                {t("cart.free_shipping_unlocked", "Kostenloser Versand freigeschaltet")}
              </p>
            )}

            <Link
              to="/checkout"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-bold text-white hover:bg-brand-700"
            >
              {t("cart.checkout", "Zur Kasse")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/products"
              className="mt-2.5 block text-center text-sm font-bold text-brand-700 hover:underline"
            >
              {t("cart.continue_shopping", "Weiter einkaufen")}
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
