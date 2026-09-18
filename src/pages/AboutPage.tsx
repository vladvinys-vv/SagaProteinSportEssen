import { Award, Leaf, ShieldCheck, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

const values = [
  { icon: Leaf, key: "about.values.quality" },
  { icon: Award, key: "about.values.germany" },
  { icon: ShieldCheck, key: "about.values.transparency" },
  { icon: Truck, key: "about.values.delivery" },
] as const;

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <section>
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-brand-600">{t("about.eyebrow", "Unsere Marke")}</p>
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">{t("nav.about")}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">{t("about.intro")}</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ icon: Icon, key }) => (
          <div key={key} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span>
            <h2 className="mt-4 text-lg font-black">{t(key)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{t(`${key}.description`)}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 text-white lg:grid-cols-2">
        <div className="p-8 md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-accent-gold">{t("about.mission_label", "Unsere Mission")}</p>
          <h2 className="mt-3 text-3xl font-black">{t("about.mission_title")}</h2>
          <p className="mt-4 leading-relaxed text-white/80">{t("about.mission_text")}</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/10 p-8 md:p-12">
          {[
            ["8+", t("about.stats.years")],
            ["25+", t("about.stats.products")],
            ["100%", t("about.stats.quality")],
            ["24h", t("about.stats.shipping")],
          ].map(([value, label]) => (
            <div key={label} className="p-4">
              <p className="text-3xl font-black">{value}</p>
              <p className="mt-1 text-sm text-white/70">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
