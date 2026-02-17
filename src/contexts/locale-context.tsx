"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Locale } from "@/lib/i18n";

const LOCALE_KEY = "siargao-locale";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
} | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCALE_KEY) as Locale | null;
      if (stored === "en" || stored === "tl") setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_KEY, l);
      document.documentElement.lang = l === "tl" ? "tl" : "en";
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  return ctx ?? { locale: "en" as Locale, setLocale: () => {} };
}
