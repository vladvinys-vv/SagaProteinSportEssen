import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function ContactPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">{t("nav.contact")}</h1>
        <p className="text-green-600">{t("contact.submitted", "Nachricht gesendet!")}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t("nav.contact")}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="max-w-md space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("contact.name", "Name")}
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("contact.email", "E-Mail")}
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("contact.message", "Nachricht")}
          </label>
          <textarea
            required
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors"
        >
          {t("contact.send", "Senden")}
        </button>
      </form>
    </div>
  );
}
