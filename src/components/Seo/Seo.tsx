import { useEffect } from "react";
import { LANGUAGES, OG_LOCALE, type Language } from "../../i18n/language";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from "../../constants/seo";

type SeoProps = {
  title: string;
  description: string;
  /** Language this page is rendered in. Drives og:locale and hreflang. */
  language: Language;
  /** Language-agnostic route ("/", "/rules"). When given, canonical and
   * hreflang alternates are derived from it automatically. */
  route?: string;
  keywords?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
};

function upsertMeta(
  name: string,
  content: string,
  attribute: "name" | "property" = "name",
) {
  let element = document.querySelector(
    `meta[${attribute}="${name}"]`,
  ) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
}

function upsertCanonical(href: string) {
  let element = document.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }

  element.href = href;
}

/**
 * Rewrites the full set of hreflang alternates for the current route.
 * They're marked with data-seo-hreflang so we only ever replace the ones
 * this component owns, never the ones baked into the prerendered HTML by
 * another page.
 */
function upsertHreflangs(route: string) {
  document
    .querySelectorAll("link[data-seo-hreflang]")
    .forEach((element) => element.remove());

  const alternates: { hreflang: string; href: string }[] = LANGUAGES.map(
    (language) => ({
      hreflang: language,
      href: absoluteUrl(route, language),
    }),
  );

  // x-default points at the Russian version: it's the bare-domain entry
  // point, and the client-side redirect sends non-Russian visitors on to
  // /en/ from there anyway.
  alternates.push({ hreflang: "x-default", href: absoluteUrl(route, "ru") });

  for (const alternate of alternates) {
    const element = document.createElement("link");
    element.rel = "alternate";
    element.hreflang = alternate.hreflang;
    element.href = alternate.href;
    element.setAttribute("data-seo-hreflang", "");
    document.head.appendChild(element);
  }
}

function upsertJsonLd(data: Record<string, unknown>) {
  const id = "seo-json-ld";
  let element = document.getElementById(id) as HTMLScriptElement | null;

  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}

function removeJsonLd() {
  document.getElementById("seo-json-ld")?.remove();
}

export function Seo({
  title,
  description,
  language,
  route,
  keywords,
  noIndex = false,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta("description", description);
    upsertMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertMeta("language", language);

    if (keywords) {
      upsertMeta("keywords", keywords);
    }

    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:locale", OG_LOCALE[language], "property");
    upsertMeta("og:site_name", SITE_NAME, "property");
    upsertMeta("og:image", DEFAULT_OG_IMAGE, "property");
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);

    if (route) {
      const canonical = absoluteUrl(route, language);
      upsertCanonical(canonical);
      upsertMeta("og:url", canonical, "property");
      upsertHreflangs(route);
    }

    if (jsonLd) {
      upsertJsonLd(jsonLd);
    } else {
      removeJsonLd();
    }

    return () => {
      removeJsonLd();
    };
  }, [title, description, language, route, keywords, noIndex, jsonLd]);

  return null;
}
