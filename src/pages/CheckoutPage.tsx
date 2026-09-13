import { useTranslation } from "react-i18next";

export default function CheckoutPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {t("checkout.title", "Kasse")}
      </h1>
      <div className="text-center py-12 text-gray-500">
        <p>{t("checkout.coming_soon", "Checkout wird gleich verfügbar sein")}</p>
      </div>
    </div>
  );
}
