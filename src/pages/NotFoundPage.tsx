import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16">
      <h1 className="text-6xl font-bold text-brand-700 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">
        {t("errors.not_found", "Seite nicht gefunden")}
      </p>
      <Link
        to="/"
        className="inline-block bg-brand-600 text-white py-2 px-6 rounded-lg hover:bg-brand-700 transition-colors"
      >
        {t("nav.home")}
      </Link>
    </div>
  );
}
