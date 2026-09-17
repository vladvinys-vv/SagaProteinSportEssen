import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-2xl font-bold text-white">
              SAGA PROTEIN
            </Link>
            <p className="text-sm mt-3">
              {t("footer.slogan", "Premium protein supplements for athletes.")}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">{t("footer.company")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">{t("nav.about")}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t("nav.contact")}</Link></li>
              <li><Link to="/imprint" className="hover:text-white transition-colors">{t("footer.imprint")}</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">{t("footer.service")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">{t("nav.products")}</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">{t("nav.cart")}</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition-colors">{t("footer.shipping")}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t("footer.returns")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">{t("footer.legal")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/imprint" className="hover:text-white transition-colors">{t("footer.terms")}</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</Link></li>
              <li className="text-xs text-gray-400">
                {t("footer.tax_id", "USt-ID: DE123456789")}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
