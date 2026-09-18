import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/features/cart";
import { formatCurrency } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 4900;

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, totalItems, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const openDrawer = () => setOpen(true);
    const closeOnEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("open-cart-drawer", openDrawer);
    document.addEventListener("keydown", closeOnEsc);
    return () => {
      document.removeEventListener("open-cart-drawer", openDrawer);
      document.removeEventListener("keydown", closeOnEsc);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-950/55" role="presentation" onMouseDown={() => setOpen(false)}>
      <aside
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.title", "Warenkorb")}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-black">{t("cart.title", "Warenkorb")}</h2>
            <p className="text-sm text-gray-500">{totalItems} {t("cart.items", "Artikel")}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label={t("cart.close", "Schließen")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold">{t("cart.empty", "Ihr Warenkorb ist leer")}</h3>
              <p className="mt-2 max-w-xs text-sm text-gray-500">
                {t("cart.empty_hint", "Entdecke jetzt Produkte, die zu Deinem Training passen.")}
              </p>
              <Link
                to="/products"
                onClick={() => setOpen(false)}
                className="mt-6 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
              >
                {t("home.shop_now", "Jetzt shoppen")}
              </Link>
            </div>
          ) : (
            <>
              {remainingForFreeShipping > 0 ? (
                <div className="mb-6 rounded-xl bg-brand-50 p-4">
                  <p className="text-sm font-semibold text-brand-800">
                    {t("cart.free_shipping_hint", "Noch")} {formatCurrency(remainingForFreeShipping, i18n.language)}{" "}
                    {t("cart.to_free_shipping", "bis zum kostenlosen Versand")}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100">
                    <div className="h-full bg-brand-600 transition-all" style={{ width: `${shippingProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-800">
                  {t("cart.free_shipping_unlocked", "Kostenloser Versand freigeschaltet")}
                </div>
              )}

              <div className="space-y-5">
                {items.map((item) => {
                  const key = `${item.productId}:${item.variantId}`;
                  return (
                    <div key={key} className="flex gap-3 rounded-2xl border border-gray-200 p-3">
                      <ProductImage product={item.product} className="h-20 w-20 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold">{item.product.name}</h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {item.variant.name} · {item.variant.flavor}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            aria-label={`${t("cart.remove", "Entfernen")}: ${item.product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center text-brand-700"
                              aria-label={t("products.decrease_quantity", "Menge verringern")}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center text-brand-700"
                              aria-label={t("products.increase_quantity", "Menge erhöhen")}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-black text-brand-700">
                            {formatCurrency(item.variant.price * item.quantity, i18n.language)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t bg-gray-50 px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">{t("cart.subtotal", "Zwischensumme")}</span>
              <span className="text-xl font-black text-brand-700">{formatCurrency(subtotal, i18n.language)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="mb-2 flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-brand-800"
            >
              {t("cart.checkout", "Zur Kasse")}
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="w-full rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-white hover:text-red-600"
            >
              {t("cart.clear", "Warenkorb leeren")}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
