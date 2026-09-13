import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t("nav.about")}</h1>
      <div className="prose max-w-3xl">
        <h2>SAGA Protein – Dein Partner für Sportnahrung</h2>
        <p>
          Wir sind SAGA Protein, ein deutsches Unternehmen, das sich auf
          hochwertige Proteinprodukte für Athleten spezialisiert hat.
        </p>
        <h3>Unsere Mission</h3>
        <p>
          Wir bieten natürliche, zertifizierte Nahrungsergänzungsmittel,
          die dir helfen, Deine Fitness-Ziele zu erreichen.
        </p>
      </div>
    </div>
  );
}
