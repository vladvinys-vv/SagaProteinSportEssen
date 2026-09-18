import { useTranslation } from "react-i18next";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="prose max-w-3xl">
      <h1>{t("footer.privacy", "Datenschutz")}</h1>
      <h2>Datenschutzerklärung</h2>
      <p>
        Wir nehmen den Schutz Ihrer personenbezogenen Daten sehr ernst. Ihre
        Daten werden ausschließlich zur Bearbeitung Ihrer Bestellung verwendet
        und nicht an Dritte verkauft.
      </p>
      <h3>Cookies</h3>
      <p>
        Unser Shop verwendet nur notwendige Cookies für die Warenkorb-Funktion.
      </p>
      <h3>Rechte</h3>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten.
      </p>
    </div>
  );
}
