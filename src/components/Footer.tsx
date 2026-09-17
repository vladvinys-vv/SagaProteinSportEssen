import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-16 bg-gray-900 py-12 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="text-2xl font-bold text-white">
              SAGA PROTEIN
            </Link>
            <p className="mt-3 text-sm">{t("footer.slogan", "Premium protein supplements for athletes.")}</p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">{t("footer.company")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="transition-colors hover:text-white">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-white">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link to="/products" className="transition-colors hover:text-white">
                  {t("nav.products")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">{t("footer.service")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/cart" className="transition-colors hover:text-white">
                  {t("nav.cart")}
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="transition-colors hover:text-white">
                  {t("checkout.title", "Checkout")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-white">
                  {t("footer.shipping", "Shipping")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">{t("footer.legal")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/imprint" className="transition-colors hover:text-white">
                  {t("footer.imprint")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-white">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li className="text-xs text-gray-400">{t("footer.tax_id", "USt-ID: DE123456789")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
