import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "en", name: "English", flag: "🇬🇧" },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const switchLanguage = async (lang: string) => {
    await changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          onMouseLeave={() => setIsOpen(false)}
        >
          <ul className="py-1">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  onClick={() => switchLanguage(lang.code)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-600 text-left ${
                    i18n.language === lang.code
                      ? "bg-brand-50 text-brand-600"
                      : "text-gray-700"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
