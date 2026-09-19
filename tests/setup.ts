import "@testing-library/jest-dom";
import { vi } from "vitest";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

Object.defineProperty(window, "matchMedia", {
  written: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Initialize i18n for tests
i18next.use(initReactI18next).init({
  lng: "de",
  fallbackLng: "de",
  resources: {
    de: {
      translation: {
        nav: {
          home: "Startseite",
          products: "Produkte",
          about: "Über uns",
          contact: "Kontakt",
          cart: "Warenkorb",
          menu: "Menü",
        },
        footer: {
          slogan: "Premium protein for athletes.",
          company: "Unternehmen",
          service: "Service",
          legal: "Rechtliches",
          imprint: "Impressum",
          privacy: "Datenschutz",
          shipping: "Versand",
          returns: "Rückgabe",
          terms: "AGB",
          tax_id: "USt-ID: DE123456789",
          copyright: "© {{year}} SAGA PROTEIN. Alle Rechte vorbehalten.",
        },
        home: {
          hero_title: "Natürliche Proteine für Deinen Erfolg",
          hero_subtitle: "Premium Whey, pflanzliche Proteine & Sportnahrung – direkt vom Hersteller.",
          shop_now: "Jetzt shoppen",
          best_sellers: "Bestseller",
          new_products: "Neu",
          sale: "Sale",
          shop_by_category: "Nach Kategorie",
          trust_badges: {
            free_shipping: "Kostenfreier Versand ab 49€",
            fast_delivery: "24h Versand",
            quality: "100% Qualitätsgarantie",
            support: "E-Mail Support 24/7",
          },
        },
        products: {
          title: "Alle Produkte",
          loading: "Lädt...",
          not_found: "Produkt nicht gefunden",
          add_to_cart: "In den Warenkorb",
          in_stock: "Auf Lager",
          out_of_stock: "Nicht vorrätig",
          low_stock: "Fast ausverkauft",
          category: {
            whey: "Whey Protein",
            plant: "Pflanzliche Proteine",
            casein: "Casein",
            amino: "Aminosäuren",
            bar: "Proteinriegel",
            mass: "Gainer",
          },
        },
        cart: {
          title: "Warenkorb",
          empty: "Ihr Warenkorb ist leer",
          total: "Gesamt",
          checkout: "Zur Kasse",
          clear: "Warenkorb leeren",
          remove: "Entfernen",
          close: "Schließen",
        },
        errors: { not_found: "Seite nicht gefunden" },
      },
    },
  },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});
