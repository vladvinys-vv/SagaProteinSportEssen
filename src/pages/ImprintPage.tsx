import { useTranslation } from "react-i18next";

export default function ImprintPage() {
  const { t } = useTranslation();

  return (
    <div className="prose max-w-3xl">
      <h1>{t("footer.imprint", "Impressum")}</h1>
      <h2>SAGA Protein GmbH</h2>
      <p>
        Musterstraße 1<br />
        12345 Berlin<br />
        Deutschland
      </p>
      <p>
        <strong>{t("contact.email", "E-Mail")}:</strong> info@sagaprotein.de<br />
        <strong>{t("contact.name", "Name")}:</strong> Max Mustermann<br />
        <strong>{t("footer.tax_id")}</strong>
      </p>
    </div>
  );
}
