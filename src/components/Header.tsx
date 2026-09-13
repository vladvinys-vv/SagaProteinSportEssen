import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation } from "react-router";
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

          <nav className="hidden md:flex space-x-1">
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
              onClick={() => (
                document.dispatchEvent(new CustomEvent("open-cart-drawer"))
              )}
              className="relative p-2 text-gray-600 hover:text-brand-600"
              aria-label={t("nav.cart")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.89 2.29M7 12h10l-.89 2.29M7 12L5 5M7 12l-2 5m0 0h14m-5 2a2 2 0 100 4 2 2 0 000-4zm-6 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
              aria-label={t("nav.menu")}
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-64" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col space-y-1 px-4 py-2">
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
