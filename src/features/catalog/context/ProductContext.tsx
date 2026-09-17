import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Product } from "@/types";
import { MOCK_PRODUCTS } from "@/data/products";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  getProductBySlug: (slug: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;

      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const getProductBySlug = useCallback(
    (slug: string) => products.find((product) => product.slug === slug),
    [products],
  );

  const value = useMemo(
    () => ({ products, loading, error, getProductBySlug }),
    [products, loading, error, getProductBySlug],
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error("useProducts must be used within ProductProvider");
  }
  return ctx;
}

export function useProduct(slug: string) {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error("useProduct must be used within ProductProvider");
  }

  const product = ctx.products.find((item) => item.slug === slug);
  const loading = ctx.loading;
  const error = !loading && !product ? "Product not found" : null;

  return { product, loading, error };
}
