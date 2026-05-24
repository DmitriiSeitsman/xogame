import { useEffect } from "react";

type SeoProps = {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
};

function upsertMeta(name: string, content: string, attribute: "name" | "property" = "name") {
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

function upsertLink(rel: string, href: string) {
  let element = document.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
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
  canonical,
  noIndex = false,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta("description", description);
    upsertMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    if (canonical) {
      upsertLink("canonical", canonical);
    }

    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");

    if (jsonLd) {
      upsertJsonLd(jsonLd);
    } else {
      removeJsonLd();
    }

    return () => {
      removeJsonLd();
    };
  }, [title, description, canonical, noIndex, jsonLd]);

  return null;
}
