import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { I18nProvider } from "../i18n/I18nProvider";
import {
  detectBrowserLanguage,
  loadLanguagePreference,
  localizePath,
  type Language,
} from "../i18n/language";
import { AppLayout } from "./AppLayout";

/**
 * Crawlers must never be auto-redirected between language versions: if
 * Googlebot or YandexBot hit `/` and got bounced to `/en/`, the Russian
 * pages could drop out of the index entirely. Real visitors still get sent
 * to the version matching their browser. hreflang tags (see Seo.tsx) are
 * what tell crawlers about the other language.
 */
const BOT_USER_AGENT =
  /bot|crawl|spider|slurp|yandex|googlebot|bingpreview|baidu|duckduck|facebookexternalhit|embedly|quora|pinterest|vkshare|whatsapp|telegrambot|applebot|petalbot|ia_archiver|lighthouse|headlesschrome/i;

function isLikelyCrawler(): boolean {
  try {
    return BOT_USER_AGENT.test(navigator.userAgent);
  } catch {
    return true;
  }
}

type LanguageRootProps = {
  language: Language;
};

export function LanguageRoot({ language }: LanguageRootProps) {
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only ever runs on the unprefixed (Russian) tree, and only once per
    // page load: a visitor who explicitly switches back to Russian stores a
    // preference, which stops this for good.
    if (language !== "ru" || hasCheckedRef.current) {
      return;
    }

    hasCheckedRef.current = true;

    if (loadLanguagePreference() !== null || isLikelyCrawler()) {
      return;
    }

    if (detectBrowserLanguage() === "ru") {
      return;
    }

    navigate(`${localizePath(pathname, "en")}${search}${hash}`, {
      replace: true,
    });
  }, [language, navigate, pathname, search, hash]);

  return (
    <I18nProvider language={language}>
      <AppLayout />
    </I18nProvider>
  );
}
