/**
 * Adds a Content-Security-Policy <meta> to every HTML file in dist/.
 *
 * GitHub Pages can't send response headers, but a CSP in <meta> works for
 * everything except frame-ancestors and reporting. It runs after
 * prerender.mjs because the prerendered pages are the files actually served.
 *
 * Inline scripts (the theme resolver and the consent-gated Metrika loader in
 * index.html) are allowed by their SHA-256 hash, computed here from the exact
 * bytes in each file, so editing them never needs a manual hash update and
 * 'unsafe-inline' stays out of script-src. JSON-LD blocks are data, not
 * scripts, and CSP doesn't apply to them.
 *
 * Hosts: the API and its WebSocket come from the same VITE_* variables the
 * app is built with; Yandex Metrika's list follows its CSP guide
 * (https://yandex.com/support/metrica/en/code/install-counter-csp). Session
 * Replay is off, so its webvisor hosts are not listed.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "..", "dist");

// Same fallbacks as src/services/apiClient.ts and realtimeClient.ts.
const apiOrigin = new URL(process.env.VITE_API_BASE_URL ?? "http://localhost:8092").origin;
const wsOrigin = new URL(process.env.VITE_WS_URL ?? "ws://localhost:8092/ws/game").origin;

const METRIKA_TLDS = [
  "ru", "com", "az", "by", "co.il", "com.am", "com.ge", "com.tr", "ee", "fr",
  "kg", "kz", "lt", "lv", "md", "tj", "tm", "uz",
];
const metrikaHosts = METRIKA_TLDS.map((tld) => `https://mc.yandex.${tld}`);

function policy(scriptHashes) {
  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      ...scriptHashes.map((hash) => `'sha256-${hash}'`),
      "https://mc.yandex.ru",
      "https://mc.yandex.com",
      "https://yastatic.net",
    ],
    // React sets inline style attributes (board size, confetti, progress
    // bars) and the unicorn SVG carries its own <style>.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...metrikaHosts],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", apiOrigin, wsOrigin, ...metrikaHosts],
    "frame-src": ["blob:", "https://mc.yandex.ru", "https://mc.yandex.com"],
    "child-src": ["blob:", "https://mc.yandex.ru", "https://mc.yandex.com"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${[...new Set(values)].join(" ")}`)
    .join("; ");
}

function inlineScriptHashes(html) {
  const hashes = [];
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const [, attributes, body] of html.matchAll(scriptPattern)) {
    if (/\bsrc\s*=/i.test(attributes)) continue;
    const type = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attributes)?.[1]?.toLowerCase();
    if (type && type !== "text/javascript" && type !== "module") continue;
    hashes.push(createHash("sha256").update(body, "utf8").digest("base64"));
  }
  return hashes;
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

const charsetPattern = /<meta\s+charset=["']?utf-8["']?\s*\/?>/i;
const files = htmlFiles(distDir);

for (const file of files) {
  const html = readFileSync(file, "utf8");
  if (html.includes('http-equiv="Content-Security-Policy"')) {
    throw new Error(`csp: ${file} already has a CSP meta tag`);
  }
  if (!charsetPattern.test(html)) {
    throw new Error(`csp: no <meta charset> in ${file} to anchor the CSP after`);
  }
  // Right after the charset: a <meta> CSP only governs what comes after it.
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(inlineScriptHashes(html))}" />`;
  writeFileSync(file, html.replace(charsetPattern, (charset) => `${charset}\n    ${meta}`), "utf8");
}

console.log(`csp: added Content-Security-Policy to ${files.length} HTML files`);
