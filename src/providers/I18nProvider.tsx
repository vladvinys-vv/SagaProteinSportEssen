import { useEffect, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { initI18n } from "@/i18n";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [ready, setReady] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!i18n.isInitialized) {
      initI18n().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [i18n]);

  if (!ready) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
