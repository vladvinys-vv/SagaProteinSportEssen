import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <>
      <Header />
      <main className="container mx-auto min-h-[70vh] px-4 py-6">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
