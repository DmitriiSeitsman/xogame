import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/useI18n";
import {
  LANGUAGES,
  localizePath,
  saveLanguagePreference,
  stripLanguagePrefix,
  type Language,
} from "../../i18n/language";
import "./LanguageSwitcher.css";

const LABELS: Record<Language, string> = {
  ru: "RU",
  en: "EN",
};

const FULL_LABELS: Record<Language, string> = {
  ru: "Русский",
  en: "English",
};

type LanguageSwitcherProps = {
  /** Extra class so the header can style the desktop and sheet variants
   * differently without a second component. */
  className?: string;
  onNavigate?: () => void;
};

/**
 * Switches language by navigating to the same page's other-language URL
 * (`/rules` <-> `/en/rules`), because the URL — not any client state — is
 * what decides the rendered language. The choice is persisted so the
 * browser-language auto-redirect on `/` stops fighting the user.
 */
export function LanguageSwitcher({
  className = "",
  onNavigate,
}: LanguageSwitcherProps) {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  const handleSwitch = (language: Language) => {
    saveLanguagePreference(language);

    if (language !== lang) {
      const route = stripLanguagePrefix(pathname);
      navigate(`${localizePath(route, language)}${search}${hash}`);
    }

    onNavigate?.();
  };

  return (
    <div
      className={`language-switcher${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={t.nav.languageSwitcher}
    >
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          className={`language-switcher__option${
            language === lang ? " language-switcher__option--active" : ""
          }`}
          onClick={() => handleSwitch(language)}
          aria-pressed={language === lang}
          lang={language}
          title={FULL_LABELS[language]}
        >
          {LABELS[language]}
        </button>
      ))}
    </div>
  );
}
