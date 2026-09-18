import { useState } from "react";
import { Package } from "lucide-react";
import { Product } from "@/types";

interface ProductImageProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export default function ProductImage({
  product,
  className = "aspect-square w-full",
  priority = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const initial = product.name.trim().charAt(0).toUpperCase();

  if (failed || product.images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 ${className}`}>
        <div className="flex flex-col items-center gap-2 text-brand-500" aria-hidden="true">
          <Package className="h-10 w-10" />
          <span className="text-3xl font-black">{initial}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={product.images[0]}
      alt={product.name}
      className={className}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
