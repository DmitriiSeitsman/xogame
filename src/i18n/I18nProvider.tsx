import { useEffect, useMemo, type ReactNode } from "react";
import { I18nContext, type I18nValue } from "./I18nContext";
import { en } from "./dictionaries/en";
import { ru } from "./dictionaries/ru";
import { HTML_LANG, localizePath, type Language } from "./language";

const DICTIONARIES = { ru, en };

type I18nProviderProps = {
  language: Language;
  children: ReactNode;
};

/**
 * Provides the dictionary for the language the current route is in, and
 * keeps `<html lang>` in sync so screen readers and search engines see the
 * right language for whichever page is on screen.
 */
export function I18nProvider({ language, children }: I18nProviderProps) {
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[language];
  }, [language]);

  const value = useMemo<I18nValue>(
    () => ({
      lang: language,
      t: DICTIONARIES[language],
      path: (route: string) => localizePath(route, language),
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
