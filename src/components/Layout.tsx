import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
