import { useState, useEffect } from "react";
import { useCart } from "@/features/cart";
import { useTranslation } from "react-i18next";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, totalItems, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const { t } = useTranslation();

  useEffect(() => {
    const openDrawer = () => setOpen(true);
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("open-cart-drawer", openDrawer);
    document.addEventListener("keydown", closeOnEsc);

    return () => {
      document.removeEventListener("open-cart-drawer", openDrawer);
      document.removeEventListener("keydown", closeOnEsc);
    };
  }, []);

  if (!open) return null;

  const currency = (cents: number) => (cents / 100).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-end"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white w-full max-w-md h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {t("cart.title", "Warenkorb")} ({totalItems})
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label={t("cart.close", "Schließen")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t("cart.empty", "Ihr Warenkorb ist leer")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">{item.variant.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"
                          aria-label="-"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"
                          aria-label="+"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{currency(item.variant.price)} €</p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 text-xs mt-1"
                      >
                        {t("cart.remove", "Entfernen")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>{t("cart.total", "Gesamt")}</span>
                  <span>{currency(subtotal)} €</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    window.location.href = "/checkout";
                  }}
                  className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors"
                >
                  {t("cart.checkout", "Zur Kasse")}
                </button>
                <button
                  onClick={clearCart}
                  className="w-full border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  {t("cart.clear", "Warenkorb leeren")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
