import i18next from "i18next";
import de from "./locales/de/translation.json";
import en from "./locales/en/translation.json";

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

    await i18next.use(initReactI18next).init({
      resources: {
        de: { translation: de },
        en: { translation: en },
      },
      lng: getInitialLanguage(),
      fallbackLng: "de",
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
  }
  return i18next;
};

export default i18next;
