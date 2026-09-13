import { useTranslation } from "react-i18next";

export default function CartPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t("cart.title", "Warenkorb")}</h1>
      <div className="text-center py-12 text-gray-500">
        <p>{t("cart.empty", "Ihr Warenkorb ist leer")}</p>
      </div>
    </div>
  );
}
