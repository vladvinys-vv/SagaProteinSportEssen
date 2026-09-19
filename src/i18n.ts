import i18next from "i18next";

export const changeLanguage = async (lng: string) => {
  await i18next.changeLanguage(lng);
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
    document.documentElement.dir = i18next.dir(lng);
  }
};

export const getInitialLanguage = (): string => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return "de";

  const saved = localStorage.getItem("i18nextLng");
  if (saved && ["de", "en"].includes(saved)) return saved;

  const browserLang = navigator.language.split("-")[0];
  if (browserLang === "de") return "de";
  if (browserLang === "en") return "en";

  const hostname = window.location.hostname;
  if (hostname.endsWith(".de") || hostname.includes("de.")) return "de";

  return "de";
};

export const initI18n = async () => {
  if (!i18next.isInitialized) {
    const { initReactI18next } = await import("react-i18next");

    const resources: Record<string, Record<string, any>> = {};
    const languages = ["de", "en"];
    const namespaces = ["translation", "catalog", "cart", "checkout", "legal"];

    for (const lang of languages) {
      resources[lang] = {};
      for (const ns of namespaces) {
        try {
          const module = await import(
            /* @vite-ignore */ `./locales/${lang}/${ns}.json`
          );
          resources[lang][ns] = module.default || module;
        } catch {
          resources[lang][ns] = {};
        }
      }
    }

    await i18next.use(initReactI18next).init({
      resources,
      lng: getInitialLanguage(),
      fallbackLng: "de",
      ns: namespaces,
      defaultNS: "translation",
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
  }
  return i18next;
};

export default i18next;
