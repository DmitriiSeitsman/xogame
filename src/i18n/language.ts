/**
 * Language plumbing: the URL is the single source of truth for which
 * language is rendered (`/` = Russian, `/en/...` = English), because that's
 * what lets search engines index both versions as separate pages. The
 * localStorage preference only decides where a *first-time* visitor to a
 * bare `/` URL gets sent — it never overrides an explicit URL.
 */

export const LANGUAGES = ["ru", "en"] as const;

export type Language = (typeof LANGUAGES)[number];

/** Russian stays unprefixed so the already-indexed URLs never move. */
export const DEFAULT_LANGUAGE: Language = "ru";

export const LANGUAGE_PREFIX: Record<Language, string> = {
  ru: "",
  en: "/en",
};

/** BCP 47 tags for <html lang>, hreflang and og:locale. */
export const HTML_LANG: Record<Language, string> = {
  ru: "ru",
  en: "en",
};

export const OG_LOCALE: Record<Language, string> = {
  ru: "ru_RU",
  en: "en_US",
};

const STORAGE_KEY = "xogame_language";

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && LANGUAGES.includes(value as Language);
}

/** Reads the language the visitor explicitly picked with the switcher. */
export function loadLanguagePreference(): Language | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isLanguage(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function saveLanguagePreference(language: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Private mode / blocked storage — the URL still carries the language.
  }
}

/** Best guess from the browser; anything non-Russian gets English. */
export function detectBrowserLanguage(): Language {
  try {
    const candidates = [
      ...(navigator.languages ?? []),
      navigator.language,
    ].filter(Boolean);

    for (const candidate of candidates) {
      if (candidate.toLowerCase().startsWith("ru")) {
        return "ru";
      }
    }

    return candidates.length > 0 ? "en" : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

/** `/en/rules` -> "en"; everything else -> "ru". */
export function getLanguageFromPathname(pathname: string): Language {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ru";
}

/** `/en/rules` -> `/rules`; `/rules` -> `/rules`. */
export function stripLanguagePrefix(pathname: string): string {
  if (pathname === "/en") {
    return "/";
  }

  if (pathname.startsWith("/en/")) {
    return pathname.slice("/en".length);
  }

  return pathname;
}

/**
 * Turns a language-agnostic route into a real one for `language`.
 * `localizePath("/rules", "en")` -> `/en/rules`.
 */
export function localizePath(path: string, language: Language): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const prefix = LANGUAGE_PREFIX[language];

  if (!prefix) {
    return normalized;
  }

  return normalized === "/" ? prefix : `${prefix}${normalized}`;
}
