import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem, Product, ProductVariant } from "@/types";

const CART_STORAGE_KEY = "saga-cart-v1";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];

    return stored.filter(
      (item): item is CartItem =>
        Boolean(
          item?.productId &&
            item?.variantId &&
            Number.isFinite(item?.quantity) &&
            item.quantity > 0 &&
            item.product &&
            item.variant
        )
    );
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getStoredCart);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, variant: ProductVariant, quantity = 1) => {
    if (!variant.inStock) return;

    const nextQuantity = Math.max(1, Math.floor(quantity));
    setItems((currentItems) => {
      const existing = currentItems.find(
        (item) => item.productId === product.id && item.variantId === variant.id
      );

      if (existing) {
        return currentItems.map((item) =>
          item.productId === product.id && item.variantId === variant.id
            ? { ...item, quantity: item.quantity + nextQuantity }
            : item
        );
      }

      return [
        ...currentItems,
        { productId: product.id, variantId: variant.id, quantity: nextQuantity, product, variant },
      ];
    });
  };

  const removeItem = (productId: string, variantId: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.productId !== productId || item.variantId !== variantId
      )
    );
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    const nextQuantity = Math.floor(quantity);
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: nextQuantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
