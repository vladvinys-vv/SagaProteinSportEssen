import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const emptyForm: ContactForm = { name: "", email: "", message: "" };

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setForm(emptyForm);
  };

  if (submitted) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black md:text-4xl">{t("contact.submitted", "Nachricht gesendet!")}</h1>
        <p className="mt-3 text-gray-700">{t("contact.submitted_hint", "Danke für Deine Nachricht. Wir melden uns schnellstmöglich.")}</p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-800"
        >
          {t("contact.send_another", "Weitere Nachricht senden")}
        </button>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-brand-600">{t("contact.eyebrow", "Wir sind für Dich da")}</p>
        <h1 className="text-3xl font-black md:text-4xl">{t("nav.contact")}</h1>
        <p className="mt-3 text-gray-600">{t("contact.intro", "Fragen zu Produkten, Bestellung oder Lieferung? Schreib uns.")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8" aria-label={t("nav.contact")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-bold">{t("contact.name")}</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-bold">{t("contact.email")}</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-bold">{t("contact.message")}</span>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-black text-white transition hover:bg-brand-800 sm:w-auto"
          >
            <Send className="h-4 w-4" />
            {t("contact.send")}
          </button>
          <p className="sr-only" aria-live="polite">{t("contact.sent", "Nachricht wurde gesendet")}</p>
        </form>

        <aside className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Mail className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-bold">{t("contact.email")}</p>
              <a href="mailto:hello@sagaprotein.de" className="text-sm text-brand-700 hover:underline">hello@sagaprotein.de</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Phone className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-bold">{t("contact.phone_short", "Telefon")}</p>
              <a href="tel:+493012345678" className="text-sm text-brand-700 hover:underline">+49 30 12345678</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><MapPin className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-bold">{t("contact.location", "Standort")}</p>
              <p className="text-sm text-gray-600">Berlin, Deutschland</p>
            </div>
          </div>
          <div className="rounded-2xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-800">
            {t("contact.response_time", "Antwortzeit: meist innerhalb eines Werktags.")}
          </div>
        </aside>
      </div>
    </section>
  );
}
