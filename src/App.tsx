import { BrowserRouter, Routes, Route } from "react-router";
import { CartProvider } from "@/features/cart/context/CartContext";
import { ProductProvider } from "@/features/catalog/context/ProductContext";
import Layout from "@/components/Layout";
import CartDrawer from "@/components/CartDrawer";
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

import CartDrawer from "@/components/CartDrawer";

function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
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
          <CartDrawer />
        </BrowserRouter>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;
