/**
 * The visitor's answer to "may we use Yandex Metrika?".
 *
 * Metrika sets cookies and sees the IP address, which Russian law treats as
 * processing personal data, so it only loads after an explicit "yes"
 * (index.html defines window.__xoLoadMetrika and calls it on page load when
 * a "granted" answer is already stored). No answer yet means no Metrika.
 *
 * A small external store so the banner and the privacy page's own controls
 * stay in step (useSyncExternalStore in useAnalyticsConsent).
 */
export type AnalyticsConsent = "granted" | "denied";

/** Also read by the inline script in index.html — keep the two in sync. */
const STORAGE_KEY = "xogame_analytics_consent";

const listeners = new Set<() => void>();

function read(): AnalyticsConsent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

let current: AnalyticsConsent | null = read();

export function getAnalyticsConsent(): AnalyticsConsent | null {
  return current;
}

export function subscribeAnalyticsConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Stores the answer and acts on it. Returns true when the page has to be
 * reloaded for it to take full effect — Metrika can't be unloaded once its
 * script is running, so withdrawing consent after it loaded needs a reload.
 */
export function setAnalyticsConsent(consent: AnalyticsConsent): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    // Not persisted; the choice still applies to this page view.
  }
  current = consent;
  listeners.forEach((listener) => listener());

  if (consent === "granted") {
    window.__xoLoadMetrika?.();
    return false;
  }

  removeMetrikaTraces();
  return window.__xoMetrikaLoaded === true;
}

/**
 * Metrika keeps its visitor id in `_ym*` cookies and localStorage keys.
 * Cookies may be set on the exact host or on the parent domain, so both
 * are expired.
 */
function removeMetrikaTraces(): void {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`];
  const parts = host.split(".");
  if (parts.length > 2) {
    domains.push(`.${parts.slice(-2).join(".")}`);
  }

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !name.startsWith("_ym")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${
        domain ? `; domain=${domain}` : ""
      }`;
    }
  }

  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("_ym")) localStorage.removeItem(key);
    }
  } catch {
    // Storage unavailable — nothing of Metrika's can be in it either.
  }
}
