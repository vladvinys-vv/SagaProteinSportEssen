import { useTranslation } from "react-i18next";

export default function CatalogPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t("products.title")}</h1>
      <div className="text-center py-12 text-gray-500">
        <p>Product catalog will be implemented here.</p>
        <p className="mt-2">Filtering, sorting, and category browsing.</p>
      </div>
    </div>
  );
}
