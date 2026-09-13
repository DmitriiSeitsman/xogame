/**
 * Post-build prerender for a client-rendered SPA.
 *
 * Vite emits a single dist/index.html whose <head> is hardcoded to one
 * language, and GitHub Pages serves that same file for every route. That
 * means every URL — Russian and English alike — would hand crawlers
 * identical Russian metadata, and only the <title> set later by JS could
 * fix it. Google usually renders JS and picks that up; Yandex is much less
 * reliable about it, so the English pages would likely never rank.
 *
 * This script writes one real HTML file per route per language with the
 * correct lang/title/description/canonical/hreflang/OG/JSON-LD already in
 * the markup, plus a plain-text block inside #root that React replaces on
 * mount. Nothing here is hidden from users: the injected text is the same
 * copy the rendered page shows.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const distDir = join(projectRoot, "dist");

const seo = JSON.parse(
  readFileSync(join(projectRoot, "src/i18n/seoPages.json"), "utf8"),
);

const LANGUAGES = ["ru", "en"];
const OG_LOCALE = { ru: "ru_RU", en: "en_US" };
const PRICE_CURRENCY = { ru: "RUB", en: "USD" };

/** "/rules" + "en" -> "/en/rules" */
function localizePath(route, language) {
  if (language === "ru") return route;
  return route === "/" ? "/en" : `/en${route}`;
}

/** Where the file lands in dist/ for a given URL path. */
function outputPathFor(urlPath) {
  return urlPath === "/"
    ? join(distDir, "index.html")
    : join(distDir, urlPath.replace(/^\//, ""), "index.html");
}

function absoluteUrl(route, language) {
  const path = localizePath(route, language);
  return `${seo.siteUrl}${path === "/" ? "/" : path}`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHead(route, language, page) {
  const canonical = absoluteUrl(route, language);

  const alternates = [
    ...LANGUAGES.map(
      (lang) =>
        `<link rel="alternate" hreflang="${lang}" href="${absoluteUrl(route, lang)}" />`,
    ),
    // Bare domain is the Russian entry point; the client-side redirect
    // forwards non-Russian visitors to /en/ from there.
    `<link rel="alternate" hreflang="x-default" href="${absoluteUrl(route, "ru")}" />`,
  ].join("\n    ");

  const documents = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: seo.pages["/"][language].h1,
      url: absoluteUrl("/", language),
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      inLanguage: language,
      description: seo.pages["/"][language].description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: PRICE_CURRENCY[language],
      },
    },
  ];

  // Breadcrumbs only make sense below the home page, where there is an
  // actual trail to describe.
  if (route !== "/") {
    documents.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: seo.pages["/"][language].h1,
          item: absoluteUrl("/", language),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.h1,
          item: canonical,
        },
      ],
    });
  }

  // FAQ answers have to be in the served HTML, not added by React after
  // mount, for the rich result to be picked up reliably — Yandex in
  // particular does not wait around for JS.
  if (Array.isArray(page.faq) && page.faq.length > 0) {
    documents.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((entry) => ({
        "@type": "Question",
        name: entry.q,
        acceptedAnswer: { "@type": "Answer", text: entry.a },
      })),
    });
  }

  const jsonLdBlocks = documents
    .map(
      (document) => `<script type="application/ld+json">
${JSON.stringify(document, null, 2)}
    </script>`,
    )
    .join("\n    ");

  return `<title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="keywords" content="${escapeHtml(page.keywords)}" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="${escapeHtml(seo.siteName)}" />
    <meta name="language" content="${language}" />

    <link rel="canonical" href="${canonical}" />
    ${alternates}

    <meta property="og:type" content="website" />
    <meta property="og:locale" content="${OG_LOCALE[language]}" />
    <meta property="og:site_name" content="${escapeHtml(seo.siteName)}" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${seo.ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(page.h1)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${seo.ogImage}" />

    ${jsonLdBlocks}`;
}

/**
 * Crawler-visible copy of the page's own headline and intro, plus links to
 * the other pages so a non-JS crawl can still discover the site. React
 * wipes this the moment it mounts.
 */
function buildRootContent(route, language, page) {
  const navLinks = Object.keys(seo.pages)
    .filter((otherRoute) => otherRoute !== route)
    .map(
      (otherRoute) =>
        `<li><a href="${localizePath(otherRoute, language)}">${escapeHtml(
          seo.pages[otherRoute][language].h1,
        )}</a></li>`,
    )
    .join("\n        ");

  const otherLanguage = language === "ru" ? "en" : "ru";

  const faq = Array.isArray(page.faq)
    ? page.faq
        .map(
          (entry) =>
            `<h2>${escapeHtml(entry.q)}</h2>
        <p>${escapeHtml(entry.a)}</p>`,
        )
        .join("\n        ")
    : "";

  return `<div id="prerender-seo">
      <h1>${escapeHtml(page.h1)}</h1>
      <p>${escapeHtml(page.intro)}</p>
      ${faq}
      <nav>
        <ul>
        ${navLinks}
        <li><a href="${localizePath(route, otherLanguage)}" hreflang="${otherLanguage}">${
          otherLanguage === "en" ? "English version" : "Русская версия"
        }</a></li>
        </ul>
      </nav>
    </div>`;
}

const template = readFileSync(join(distDir, "index.html"), "utf8");

// Everything between <title> and the closing </script> of the JSON-LD block
// is the language-specific part of the template's head.
const headStart = template.indexOf("<title>");
const jsonLdEnd = template.indexOf("</script>", template.indexOf("application/ld+json"));

if (headStart === -1 || jsonLdEnd === -1) {
  throw new Error(
    "prerender: couldn't locate the templated <head> block in dist/index.html",
  );
}

const headEnd = jsonLdEnd + "</script>".length;
const beforeHead = template.slice(0, headStart);
const afterHead = template.slice(headEnd);

let written = 0;

for (const route of Object.keys(seo.pages)) {
  for (const language of LANGUAGES) {
    const page = seo.pages[route][language];
    const urlPath = localizePath(route, language);

    let html = `${beforeHead}${buildHead(route, language, page)}${afterHead}`
      .replace(/<html lang="[^"]*">/, `<html lang="${language}">`)
      .replace(
        '<div id="root"></div>',
        `<div id="root">${buildRootContent(route, language, page)}</div>`,
      );

    // The manifest link sits above the templated block (it's the same file
    // for every route), so the English variant is swapped in here instead.
    if (language === "en") {
      html = html.replace("/site.webmanifest", "/site.en.webmanifest");
    }

    const outputPath = outputPathFor(urlPath);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html, "utf8");
    written += 1;
    console.log(`  prerendered ${urlPath} -> ${outputPath.replace(distDir, "dist")}`);
  }
}

// The SPA fallback that GitHub Pages serves for unknown paths (game/join
// URLs, 404s). It must stay language-neutral and unindexed, so it gets the
// Russian home shell with noindex rather than a copy of a real page.
const fallback = readFileSync(join(distDir, "index.html"), "utf8").replace(
  '<meta name="robots" content="index, follow" />',
  '<meta name="robots" content="noindex, follow" />',
);
writeFileSync(join(distDir, "404.html"), fallback, "utf8");

/**
 * sitemap.xml is generated from the same seoPages.json the pages come
 * from, so a new route can never be added to the site and forgotten in the
 * sitemap (which is exactly what a hand-maintained file invites). It
 * overwrites the placeholder copied out of public/.
 */
const SITEMAP_HINTS = {
  "/": { changefreq: "weekly", priority: "1.0" },
  "/strategy": { changefreq: "monthly", priority: "0.8" },
  "/rules": { changefreq: "monthly", priority: "0.7" },
  "/about": { changefreq: "monthly", priority: "0.6" },
  "/contacts": { changefreq: "yearly", priority: "0.4" },
};

const lastmod = new Date().toISOString().slice(0, 10);

const sitemapEntries = [];

for (const route of Object.keys(seo.pages)) {
  const hint = SITEMAP_HINTS[route] ?? { changefreq: "monthly", priority: "0.5" };

  for (const language of LANGUAGES) {
    const alternates = [
      ...LANGUAGES.map(
        (lang) =>
          `    <xhtml:link rel="alternate" hreflang="${lang}" href="${absoluteUrl(route, lang)}" />`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(route, "ru")}" />`,
    ].join("\n");

    sitemapEntries.push(
      `  <url>
    <loc>${absoluteUrl(route, language)}</loc>
${alternates}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${hint.changefreq}</changefreq>
    <priority>${hint.priority}</priority>
  </url>`,
    );
  }
}

writeFileSync(
  join(distDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join("\n")}
</urlset>
`,
  "utf8",
);

console.log(
  `prerender: wrote ${written} pages + 404.html fallback + sitemap.xml (${sitemapEntries.length} urls)`,
);
