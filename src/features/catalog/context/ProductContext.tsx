import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { MOCK_PRODUCTS } from "@/data/products";
import { Product } from "@/types";

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
    let active = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (!active) return;
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const getProductBySlug = useCallback(
    (slug: string) => products.find((product) => product.slug === slug),
    [products]
  );

  return (
    <ProductContext.Provider value={{ products, loading, error, getProductBySlug }}>
      {children}
    </ProductContext.Provider>
  );
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

  const [product, setProduct] = useState<Product | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ctx.loading) {
      setProduct(undefined);
      setError(null);
      setLoading(true);
      return;
    }

    const found = ctx.getProductBySlug(slug);
    setProduct(found);
    setError(found ? null : "Product not found");
    setLoading(false);
  }, [ctx.getProductBySlug, ctx.loading, slug]);

  return { product, loading, error };
}
