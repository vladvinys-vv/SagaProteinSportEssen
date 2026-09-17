import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Check, LockKeyhole, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/features/cart";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const currency = (cents: number) => (cents / 100).toFixed(2);
  const shipping = subtotal >= 4900 ? 0 : 499;
  const total = subtotal + shipping;

  if (items.length === 0 && !submitted) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center">
        <p className="text-xl font-black text-gray-800">{t("cart.empty", "Ihr Warenkorb ist leer")}</p>
        <p className="mt-2 text-sm text-gray-500">{t("checkout.empty_hint", "Fügen Sie zuerst Produkte hinzu.")}</p>
        <Link
          to="/products"
          className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        >
          {t("cart.browse", "Produkte entdecken")}
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-green-200 bg-green-50 px-6 py-12 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <Check className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
          {t("checkout.success_eyebrow", "Bestellung erhalten")}
        </p>
        <h1 className="mt-3 text-4xl font-black text-gray-900">{t("checkout.success_title", "Vielen Dank!")}</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-gray-600">
          {t("checkout.success_message", "Ihre Testbestellung wurde erfolgreich aufgenommen. Eine Bestätigung wurde an Ihre E-Mail-Adresse gesendet.")}
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-gray-700">
          <LockKeyhole className="h-4 w-4 text-brand-600" aria-hidden="true" />
          {t("checkout.order_number", "Bestellnummer")}: SAGA-2026-001
        </div>
        <div className="mt-8">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-lg bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700"
          >
            {t("checkout.continue_shopping", "Weiter einkaufen")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Secure checkout</p>
        <h1 className="mt-2 text-4xl font-black text-gray-900">{t("checkout.title", "Kasse")}</h1>
        <p className="mt-3 text-gray-500">{t("checkout.subtitle", "Adresse und Zahlung für Ihre Bestellung angeben.")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            clearCart();
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                1
              </span>
              <h2 className="text-lg font-black">{t("checkout.contact", "Kontakt")}</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-gray-700" htmlFor="checkout-email">
                  {t("contact.email", "E-Mail")}
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none ring-brand-200 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700" htmlFor="checkout-first-name">
                  {t("checkout.first_name", "Vorname")}
                </label>
                <input
                  id="checkout-first-name"
                  type="text"
                  required
                  autoComplete="given-name"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none ring-brand-200 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700" htmlFor="checkout-last-name">
                  {t("checkout.last_name", "Nachname")}
                </label>
                <input
                  id="checkout-last-name"
                  type="text"
                  required
                  autoComplete="family-name"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none ring-brand-200 focus:ring-2"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                2
              </span>
              <h2 className="text-lg font-black">{t("checkout.shipping_address", "Lieferadresse")}</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-gray-700" htmlFor="checkout-street">
                  {t("checkout.street", "Straße und Hausnummer")}
                </label>
                <input
                  id="checkout-street"
                  type="text"
                  required
                  autoComplete="street-address"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none ring-brand-200 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700" htmlFor="checkout-zip">
                  {t("checkout.zip", "Postleitzahl")}
                </label>
                <input
                  id="checkout-zip"
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none ring-brand-200 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700" htmlFor="checkout-city">
                  {t("checkout.city", "Stadt")}
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  required
                  autoComplete="address-level2"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none ring-brand-200 focus:ring-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-gray-700" htmlFor="checkout-country">
                  {t("checkout.country", "Land")}
                </label>
                <select
                  id="checkout-country"
                  required
                  autoComplete="country"
                  defaultValue="DE"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none ring-brand-200 focus:ring-2"
                >
                  <option value="DE">Deutschland</option>
                  <option value="AT">Österreich</option>
                  <option value="CH">Schweiz</option>
                  <option value="NL">Niederlande</option>
                  <option value="BE">Belgien</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                3
              </span>
              <h2 className="text-lg font-black">{t("checkout.payment", "Zahlung")}</h2>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { value: "credit_card", label: t("checkout.card", "Kreditkarte") },
                { value: "paypal", label: "PayPal" },
                { value: "invoice", label: t("checkout.invoice", "Rechnung") },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-brand-300"
                >
                  <input type="radio" name="payment" value={method.value} defaultChecked={method.value === "credit_card"} />
                  <span className="text-sm font-bold">{method.label}</span>
                </label>
              ))}
            </div>
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-5 text-gray-600">
              <input type="checkbox" required className="mt-0.5" />
              <span>{t("checkout.terms", "Ich akzeptiere die AGB und habe die Datenschutzerklärung gelesen.")}</span>
            </label>
          </section>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-4 font-bold text-white transition hover:bg-brand-700"
          >
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            {t("checkout.place_order", "Kostenpflichtig bestellen")}
          </button>
          <p className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {t("checkout.secure", "Verschlüsselte und sichere Übertragung")}
          </p>
        </form>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">{t("cart.order_summary", "Zusammenfassung")}</h2>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              {items.reduce((sum, item) => sum + item.quantity, 0)} {t("products.results", "Produkte")}
            </span>
          </div>
          <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.productId}:${item.variantId}`} className="flex gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-accent-gold/30 text-lg font-black text-brand-700">
                  {item.product.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.product.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{item.variant.name} × {item.quantity}</p>
                  <p className="mt-1 text-sm font-bold text-brand-700">{currency(item.variant.price * item.quantity)} €</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{t("cart.subtotal", "Zwischensumme")}</span>
              <span className="font-bold">{currency(subtotal)} €</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" aria-hidden="true" /> {t("cart.shipping", "Versand")}</span>
              <span className="font-bold">{shipping === 0 ? t("cart.free", "Kostenlos") : `${currency(shipping)} €`}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="font-black">{t("cart.total", "Gesamt")}</span>
              <span className="text-xl font-black text-brand-700">{currency(total)} €</span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-gray-500">
            {t("checkout.tax_hint", "Inklusive gesetzlicher MwSt. Der Checkout ist eine Demo und löst keine echte Zahlung aus.")}
          </p>
        </aside>
      </div>
    </div>
  );
}
