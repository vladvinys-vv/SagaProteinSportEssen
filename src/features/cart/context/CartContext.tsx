import { createContext, useContext, useState, ReactNode } from "react";
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, variant: ProductVariant, quantity = 1) => {
    const existing = items.find(
      (item) => item.productId === product.id && item.variantId === variant.id
    );

    if (existing) {
      updateQuantity(existing.productId, existing.quantity + quantity);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        variantId: variant.id,
        quantity,
        product,
        variant,
      };
      setItems((prev) => [...prev, newItem]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== itemId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
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
