import seoPages from "../i18n/seoPages.json";
import { localizePath, type Language } from "../i18n/language";

/** Production site URL. */
export const SITE_URL: string = seoPages.siteUrl;

export const SITE_NAME: string = seoPages.siteName;

export const DEFAULT_OG_IMAGE: string = seoPages.ogImage;

export type PageSeo = {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  intro: string;
};

/** Language-agnostic routes that exist in both languages and get indexed. */
export type IndexedRoute = keyof typeof seoPages.pages;

export const INDEXED_ROUTES = Object.keys(seoPages.pages) as IndexedRoute[];

export function getPageSeo(route: IndexedRoute, language: Language): PageSeo {
  return seoPages.pages[route][language];
}

/** Absolute URL of a route in a given language. */
export function absoluteUrl(route: string, language: Language): string {
  const path = localizePath(route, language);
  return `${SITE_URL}${path === "/" ? "/" : path}`;
}

/**
 * schema.org WebApplication markup, localised. Search engines use
 * `inLanguage` to tell the two versions apart, so it has to match the page
 * it's embedded in rather than being one shared Russian blob.
 */
export function getWebApplicationJsonLd(
  language: Language,
): Record<string, unknown> {
  const home = getPageSeo("/", language);

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: home.h1,
    url: absoluteUrl("/", language),
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    inLanguage: language,
    description: home.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: language === "ru" ? "RUB" : "USD",
    },
  };
}
