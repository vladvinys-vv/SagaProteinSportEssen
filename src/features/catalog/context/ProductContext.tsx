import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
    // TODO: Replace with real API call
    // Simulate network delay
    setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 500);
  }, []);

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug);
  };

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
    setLoading(true);
    // Use the context's getProductBySlug directly for immediate results
    const found = ctx.getProductBySlug(slug);
    if (found) {
      setProduct(found);
      setError(null);
    } else {
      setError("Product not found");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, ctx.products.length]);

  return { product, loading, error };
}
