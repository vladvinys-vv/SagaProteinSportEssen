import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const pageTitles: Record<string, string> = {
  "/": "home.page_title",
  "/products": "products.title",
  "/cart": "cart.title",
  "/checkout": "checkout.title",
  "/about": "nav.about",
  "/contact": "nav.contact",
  "/imprint": "footer.imprint",
  "/privacy": "footer.privacy",
  "/shipping": "shipping.title",
  "/terms": "terms.title",
};

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const titleKey = pageTitles[pathname] || "errors.not_found";

  useEffect(() => {
    const title = `${t(titleKey)} | SAGA PROTEIN`;
    document.title = title;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute("content", t("meta.description"));
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, t, titleKey]);

  return (
    <>
      <Header />
      <main className="container mx-auto min-h-[70vh] px-4 py-6">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
