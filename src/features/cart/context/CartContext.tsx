import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { CartItem, Product, ProductVariant } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "saga-cart";

const getItemId = (productId: string, variantId: string) => `${productId}:${variantId}`;

const readStoredItems = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];

    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        typeof item?.productId === "string" &&
        typeof item?.variantId === "string" &&
        Number.isFinite(item?.quantity) &&
        item.quantity > 0 &&
        Boolean(item.product) &&
        Boolean(item.variant),
    );
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredItems);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      return;
    }
  }, [items]);

  const addItem = useCallback(
    (product: Product, variant: ProductVariant, quantity = 1) => {
      const nextQuantity = Math.max(1, Math.floor(quantity));
      const itemId = getItemId(product.id, variant.id);

      setItems((currentItems) => {
        const existing = currentItems.find((item) => getItemId(item.productId, item.variantId) === itemId);
        if (existing) {
          return currentItems.map((item) =>
            getItemId(item.productId, item.variantId) === itemId
              ? { ...item, quantity: item.quantity + nextQuantity }
              : item,
          );
        }

        return [
          ...currentItems,
          {
            productId: product.id,
            variantId: variant.id,
            quantity: nextQuantity,
            product,
            variant,
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => getItemId(item.productId, item.variantId) !== itemId),
    );
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const nextQuantity = Math.floor(quantity);
    if (nextQuantity <= 0) {
      setItems((currentItems) =>
        currentItems.filter((item) => getItemId(item.productId, item.variantId) !== itemId),
      );
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        getItemId(item.productId, item.variantId) === itemId
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0),
    [items],
  );
  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
