export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  weight: string;
  flavor: string;
  sku: string;
  inStock: boolean;
  servings: number;
}

export interface NutritionalInfo {
  perServing: Record<string, string>;
  per100g: Record<string, string>;
  warnings: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  images: string[];
  variants: ProductVariant[];
  categories: string[];
  tags: string[];
  nutritionalInfo: NutritionalInfo;
  ingredients: string[];
  brand: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestseller: boolean;
  newProduct: boolean;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
  deliveryInfo: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export interface Address {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
}

export interface Customer {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  address?: Address;
}

export type CountryCode = "DE" | "AT" | "CH" | "NL" | "BE" | "DK" | "SE" | "NO" | "FI" | "PL";

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: "EUR" | "USD" | "GBP";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
  shippingMethod: "standard" | "express" | "overnight";
  paymentMethod: "credit_card" | "paypal" | "invoice" | "sepa_direct_debit";
  trackingNumber?: string;
}
