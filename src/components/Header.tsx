import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation } from "react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/features/cart";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
  const { t } = useTranslation();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-brand-700">
              SAGA PROTEIN
            </Link>
          </div>

          <nav className="hidden md:flex space-x-1" aria-label={t("nav.main", "Hauptnavigation")}>
            {[
              { path: "/", label: t("nav.home") },
              { path: "/products", label: t("nav.products") },
              { path: "/about", label: t("nav.about") },
              { path: "/contact", label: t("nav.contact") },
            ].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "text-gray-600 hover:text-brand-600 hover:bg-brand-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => document.dispatchEvent(new CustomEvent("open-cart-drawer"))}
              className="relative rounded-xl p-2 text-gray-600 transition hover:bg-brand-50 hover:text-brand-700"
              aria-label={t("nav.cart")}
            >
              <ShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-black text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-gray-600 transition hover:bg-brand-50 hover:text-brand-700 md:hidden"
              aria-label={t("nav.menu")}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-64" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col space-y-1 px-4 py-2" aria-label={t("nav.mobile", "Mobile Navigation")}>
          {[
            { path: "/", label: t("nav.home") },
            { path: "/products", label: t("nav.products") },
            { path: "/about", label: t("nav.about") },
            { path: "/contact", label: t("nav.contact") },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:text-brand-600 hover:bg-brand-50"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="px-4 py-2">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
