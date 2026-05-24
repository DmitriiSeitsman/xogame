/** Production site URL (Cyrillic IDN). */
export const SITE_URL = "https://крестик-нолик.рф";

/** Punycode version for sitemap.xml and technical files. */
export const SITE_URL_PUNYCODE = "https://xn----itbjbgccgrkqnn.xn--p1ai";

export const SITE_NAME = "Крестик-нолик.рф";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Крестики-нолики онлайн",
  url: `${SITE_URL}/`,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  inLanguage: "ru",
  description:
    "Бесплатная онлайн игра крестики-нолики с компьютером, другом по ссылке или случайным игроком.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "RUB",
  },
} as const;
