import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const defaultNS = "translation";

export const changeLanguage = async (lng: string) => {
  await i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir(lng);
};

export const getInitialLanguage = (): string => {
  // Check user preference
  const saved = localStorage.getItem("i18nextLng");
  if (saved && ["de", "en"].includes(saved)) return saved;

  // Check browser language
  const browserLang = navigator.language.split("-")[0];
  if (browserLang === "de") return "de";
  if (browserLang === "en") return "en";

  // Default to German for .de domain
  const hostname = window.location.hostname;
  if (hostname.endsWith(".de") || hostname.includes("de.")) return "de";

  return "de";
};

export const initI18n = async () => {
  const resources: Record<string, any> = {};

  const languages = ["de", "en"];
  const namespaces = ["translation", "catalog", "cart", "checkout", "legal"];

  for (const lang of languages) {
    resources[lang] = { [defaultNS]: {} };
    for (const ns of namespaces) {
      try {
        const module = await import(
          /* @vite-ignore */ `./locales/${lang}/${ns}.json`
        );
        resources[lang][ns] = module.default || module;
      } catch {
        // Fallback to empty translations
      }
    }
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "de",
    ns: namespaces,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return i18n;
};

export default i18n;
