import i18n from "i18next";
import { initReactI18next } from "react-i18next";

let initialization: Promise<typeof i18n> | undefined;

export function initI18n() {
  if (!initialization) {
    initialization = i18n
      .use(initReactI18next)
      .init({
        lng: "ru",
        fallbackLng: "ru",
        interpolation: { escapeValue: false },
        resources: { ru: { translation: {} } },
      })
      .then(() => i18n);
  }

  return initialization;
}

export default i18n;
