import { useState, useEffect } from "react";
import { useCart } from "@/features/cart";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

const getItemId = (productId: string, variantId: string) => `${productId}:${variantId}`;

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, totalItems, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    document.body.classList.toggle("overflow-hidden", open);
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  const currency = (cents: number) => (cents / 100).toFixed(2);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div
        className="absolute inset-0 bg-gray-950/50 transition-opacity duration-200"
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.title", "Warenkorb")}
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl font-black">
            {t("cart.title", "Warenkorb")} <span className="text-brand-600">({totalItems})</span>
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label={t("cart.close", "Schließen")}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-6">
          {items.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <ShoppingBag className="h-7 w-7" aria-hidden="true" />
              </div>
              <p className="font-bold text-gray-800">{t("cart.empty", "Ihr Warenkorb ist leer")}</p>
              <p className="mt-2 text-sm text-gray-500">
                {t("cart.empty_hint", "Entdecken Sie unsere Produkte und stellen Sie Ihren Warenkorb zusammen.")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/products");
                }}
                className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
              >
                {t("cart.browse", "Produkte entdecken")}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {items.map((item) => {
                  const itemId = getItemId(item.productId, item.variantId);
                  return (
                    <div key={itemId} className="flex gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-accent-gold/30 text-2xl font-black text-brand-700">
                        {item.product.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-sm text-gray-900">{item.product.name}</h3>
                            <p className="mt-0.5 text-sm text-gray-500">{item.variant.name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(itemId)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            aria-label={`${t("cart.remove", "Entfernen")}: ${item.product.name}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-gray-200">
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemId, item.quantity - 1)}
                              className="rounded-l-lg px-2.5 py-1.5 text-gray-600 hover:text-brand-700"
                              aria-label={t("cart.decrease", "Menge verringern")}
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemId, item.quantity + 1)}
                              className="rounded-r-lg px-2.5 py-1.5 text-gray-600 hover:text-brand-700"
                              aria-label={t("cart.increase", "Menge erhöhen")}
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                          <span className="font-bold text-brand-700">
                            {currency(item.variant.price * item.quantity)} €
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t("cart.subtotal", "Zwischensumme")}</span>
                  <span className="text-xl font-black">{currency(subtotal)} €</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {t("cart.shipping_hint", "Kostenloser Versand ab 49 €. Versandkosten werden im Checkout berechnet.")}
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/checkout");
                  }}
                  className="w-full rounded-lg bg-brand-600 px-5 py-3 font-bold text-white transition hover:bg-brand-700"
                >
                  {t("cart.checkout", "Zur Kasse")}
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                >
                  {t("cart.clear", "Warenkorb leeren")}
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
