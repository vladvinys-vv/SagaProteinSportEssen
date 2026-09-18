import { useState, type FormEvent } from "react";
import { CheckCircle2, LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useCart } from "@/features/cart";
import { formatCurrency } from "@/lib/format";
import { Address, Order } from "@/types";

const emptyAddress: Address = {
  street: "",
  houseNumber: "",
  zipCode: "",
  city: "",
  state: "",
  country: "DE",
};

type ShippingMethod = "standard" | "express";
type PaymentMethod = "paypal" | "credit_card" | "invoice" | "sepa_direct_debit";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paypal");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const shipping = shippingMethod === "express" ? 990 : subtotal >= 4900 ? 0 : 490;
  const tax = Math.round((subtotal + shipping) * 0.19);
  const total = subtotal + shipping + tax;

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!termsAccepted) return;

    const orderNumber = `SAGA-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setOrder({
      id: orderNumber,
      orderNumber,
      customer: { email, name, phone: phone || undefined, address },
      items,
      subtotal,
      shipping,
      tax,
      total,
      currency: "EUR",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shippingMethod,
      paymentMethod,
    });
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (order) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">{t("checkout.success_label", "Bestellung bestätigt")}</p>
        <h1 className="mt-2 text-3xl font-black md:text-4xl">{t("checkout.success_title", "Danke für Deine Bestellung!")}</h1>
        <p className="mt-4 text-gray-700">{t("checkout.success_text", "Wir haben Deine Bestellung erhalten und melden uns per E-Mail.")}</p>
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-gray-700">
          <span>{t("checkout.order_number", "Bestellnummer")}: <strong>{order.orderNumber}</strong></span>
          <span>{t("cart.total", "Gesamt")}: <strong>{formatCurrency(order.total, i18n.language)}</strong></span>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/products" className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white hover:bg-brand-800">
            {t("cart.continue_shopping", "Weiter einkaufen")}
          </Link>
          <Link to="/" className="rounded-xl border border-brand-700 px-6 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50">
            {t("nav.home", "Startseite")}
          </Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex min-h-[32rem] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
        <PackageCheck className="mb-4 h-12 w-12 text-brand-400" />
        <h1 className="text-2xl font-black md:text-3xl">{t("checkout.title", "Kasse")}</h1>
        <p className="mt-3 max-w-md text-gray-600">{t("checkout.empty", "Lege zuerst Produkte in Deinen Warenkorb.")}</p>
        <Link to="/products" className="mt-6 rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white hover:bg-brand-800">
          {t("home.shop_now", "Jetzt shoppen")}
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">{t("checkout.secure", "Sicherer Checkout")}</p>
        <h1 className="text-3xl font-black md:text-4xl">{t("checkout.title", "Kasse")}</h1>
        <p className="mt-3 max-w-2xl text-gray-600">{t("checkout.subtitle", "Versand und Zahlung in wenigen Schritten abgeschlossen.")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <form onSubmit={submitOrder} className="space-y-7 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <section>
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black">{t("checkout.contact", "Kontakt")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold">{t("contact.name", "Name")}</span>
                <input required value={name} onChange={(event) => setName(event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold">E-Mail</span>
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold">{t("checkout.phone", "Telefon (optional)")}</span>
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-lg font-black">{t("checkout.address", "Versandadresse")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-3">
                <span className="mb-1.5 block text-sm font-bold">{t("checkout.street", "Straße")}</span>
                <input required value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">{t("checkout.house_number", "Hausnummer")}</span>
                <input required value={address.houseNumber} onChange={(event) => setAddress({ ...address, houseNumber: event.target.value })} className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">{t("checkout.zip", "PLZ")}</span>
                <input required value={address.zipCode} onChange={(event) => setAddress({ ...address, zipCode: event.target.value })} className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">{t("checkout.city", "Stadt")}</span>
                <input required value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">{t("checkout.state", "Bundesland")}</span>
                <input required value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold">{t("checkout.country", "Land")}</span>
                <select value={address.country} onChange={(event) => setAddress({ ...address, country: event.target.value })} className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                  <option value="DE">Deutschland</option>
                  <option value="AT">Österreich</option>
                  <option value="CH">Schweiz</option>
                  <option value="NL">Niederlande</option>
                  <option value="BE">Belgien</option>
                </select>
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-lg font-black">{t("checkout.shipping_method", "Versandart")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`cursor-pointer rounded-2xl border-2 p-4 transition ${shippingMethod === "standard" ? "border-brand-700 bg-brand-50" : "border-gray-200 hover:border-brand-300"}`}>
                <input type="radio" name="shipping" value="standard" checked={shippingMethod === "standard"} onChange={() => setShippingMethod("standard")} className="accent-brand-700" />
                <span className="mt-2 block text-sm font-bold">{t("checkout.standard_shipping", "Standard")}</span>
                <span className="mt-1 block text-sm text-gray-600">{subtotal >= 4900 ? t("checkout.free", "Kostenlos") : formatCurrency(490, i18n.language)}</span>
              </label>
              <label className={`cursor-pointer rounded-2xl border-2 p-4 transition ${shippingMethod === "express" ? "border-brand-700 bg-brand-50" : "border-gray-200 hover:border-brand-300"}`}>
                <input type="radio" name="shipping" value="express" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} className="accent-brand-700" />
                <span className="mt-2 block text-sm font-bold">{t("checkout.express_shipping", "Express")}</span>
                <span className="mt-1 block text-sm text-gray-600">{formatCurrency(990, i18n.language)}</span>
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-lg font-black">{t("checkout.payment", "Zahlung")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["paypal", "PayPal"],
                ["credit_card", t("checkout.credit_card", "Kreditkarte")],
                ["invoice", t("checkout.invoice", "Rechnung")],
                ["sepa_direct_debit", "SEPA-Lastschrift"],
              ].map(([value, label]) => (
                <label key={value} className={`cursor-pointer rounded-2xl border-2 p-4 text-sm font-bold transition ${paymentMethod === value ? "border-brand-700 bg-brand-50" : "border-gray-200 hover:border-brand-300"}`}>
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value as PaymentMethod)} className="accent-brand-700" />
                  <span className="ml-2">{label}</span>
                </label>
              ))}
            </div>
          </section>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
            <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-700" />
            <span>{t("checkout.terms", "Ich akzeptiere die AGB und habe die Datenschutzerklärung gelesen.")}</span>
          </label>

          <button type="submit" disabled={!termsAccepted} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-4 text-base font-black text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-300">
            <LockKeyhole className="h-5 w-5" />
            {t("checkout.place_order", "Kostenpflichtig bestellen")} · {formatCurrency(total, i18n.language)}
          </button>
          <p className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4" /> {t("checkout.secure_note", "SSL-verschlüsselt und käuferschutzkonform")}
          </p>
        </form>

        <aside className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-lg font-black">{t("cart.order_summary", "Bestellübersicht")}</h2>
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.productId}:${item.variantId}`} className="flex gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-black text-brand-700">{item.quantity}x</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.product.name}</p>
                  <p className="text-xs text-gray-500">{item.variant.name}</p>
                  <p className="mt-1 text-sm font-bold">{formatCurrency(item.variant.price * item.quantity, i18n.language)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between text-gray-600"><span>{t("cart.subtotal", "Zwischensumme")}</span><span>{formatCurrency(subtotal, i18n.language)}</span></div>
            <div className="flex justify-between text-gray-600"><span>{t("checkout.shipping", "Versand")}</span><span>{shipping === 0 ? t("checkout.free", "Kostenlos") : formatCurrency(shipping, i18n.language)}</span></div>
            <div className="flex justify-between text-gray-600"><span>{t("checkout.tax", "MwSt. (19%)")}</span><span>{formatCurrency(tax, i18n.language)}</span></div>
            <div className="flex justify-between border-t pt-3 text-base font-black"><span>{t("cart.total", "Gesamt")}</span><span className="text-brand-700">{formatCurrency(total, i18n.language)}</span></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
