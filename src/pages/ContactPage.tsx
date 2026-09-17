import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Send } from "lucide-react";

export default function ContactPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-green-200 bg-green-50 px-6 py-12 text-center" role="status">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <Check className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">{t("nav.contact")}</h1>
        <p className="mt-3 font-bold text-green-700">{t("contact.submitted", "Nachricht gesendet!")}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
          {t("contact.submitted_hint", "Vielen Dank. Wir melden uns so schnell wie möglich bei dir.")}
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormVersion((version) => version + 1);
          }}
          className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        >
          {t("contact.send_another", "Weitere Nachricht senden")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">{t("contact.eyebrow", "Wir helfen gerne")}</p>
        <h1 className="mt-2 text-4xl font-black text-gray-900">{t("nav.contact")}</h1>
        <p className="mt-3 text-gray-500">{t("contact.hint", "Schreibe uns eine Nachricht zu Produkten, Bestellung oder Lieferung.")}</p>
      </div>
      <form
        key={formVersion}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700" htmlFor="contact-name">
            {t("contact.name", "Name")}
          </label>
          <input
            id="contact-name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none ring-brand-200 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700" htmlFor="contact-email">
            {t("contact.email", "E-Mail")}
          </label>
          <input
            id="contact-email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none ring-brand-200 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700" htmlFor="contact-message">
            {t("contact.message", "Nachricht")}
          </label>
          <textarea
            id="contact-message"
            required
            rows={6}
            className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 outline-none ring-brand-200 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-700 sm:w-auto"
        >
          {t("contact.send", "Senden")}
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
