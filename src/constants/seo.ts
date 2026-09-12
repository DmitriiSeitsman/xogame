/** Production site URL. */
export const SITE_URL = "https://xo-game.online";

/** Kept for backward compat with anything that still imports the punycode
 * constant name — now just equals SITE_URL since xo-game.online is already
 * plain ASCII (no IDN punycode encoding needed). */
export const SITE_URL_PUNYCODE = SITE_URL;

export const SITE_NAME = "XO Game";

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
