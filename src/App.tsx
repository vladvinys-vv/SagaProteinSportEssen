import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { CartProvider } from "@/features/cart/context/CartContext";
import { ProductProvider } from "@/features/catalog/context/ProductContext";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import ProductPage from "@/pages/ProductPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import ImprintPage from "@/pages/ImprintPage";
import PrivacyPage from "@/pages/PrivacyPage";
import NotFoundPage from "@/pages/NotFoundPage";

const routeTitleKeys = {
  "/": "home",
  "/products": "products",
  "/cart": "cart",
  "/checkout": "checkout",
  "/about": "about",
  "/contact": "contact",
  "/imprint": "imprint",
  "/privacy": "privacy",
} as const;

function RouteEffects() {
  const location = useLocation();
  const { t } = useTranslation();
  const titleKey = location.pathname.startsWith("/products/")
    ? "products"
    : routeTitleKeys[location.pathname as keyof typeof routeTitleKeys] ?? "not_found";

  useEffect(() => {
    document.title = `${t(`titles.${titleKey}`, "SAGA PROTEIN")} | SAGA PROTEIN`;
    window.scrollTo(0, 0);
  }, [location.pathname, titleKey, t]);

  return null;
}

function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <BrowserRouter>
          <RouteEffects />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />
              <Route path="/products" element={<CatalogPage />} />
              <Route path="/products/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/imprint" element={<ImprintPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;
