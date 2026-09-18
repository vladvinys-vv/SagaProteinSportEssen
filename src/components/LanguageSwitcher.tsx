import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";

const languages = [
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "en", name: "English", flag: "🇬🇧" },
] as const;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((language) => language.code === i18n.language) || languages[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const switchLanguage = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm transition-colors hover:bg-gray-200"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="language-menu"
        aria-label={`${currentLang.name} auswählen`}
      >
        <Globe2 className="h-4 w-4" aria-hidden="true" />
        <span>{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id="language-menu"
          role="menu"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
        >
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              role="menuitemradio"
              aria-checked={i18n.language === language.code}
              onClick={() => void switchLanguage(language.code)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-brand-50 ${
                i18n.language === language.code ? "font-bold text-brand-700" : "text-gray-700"
              }`}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
              {i18n.language === language.code && <span className="ml-auto text-brand-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
