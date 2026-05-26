import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { YANDEX_METRIKA_ID } from "../../constants/yandexMetrika";

function getPageUrl(pathname: string, search: string, hash: string): string {
  return `${window.location.origin}${pathname}${search}${hash}`;
}

function trackPageView(url: string): void {
  if (typeof window.ym !== "function") {
    return;
  }

  window.ym(YANDEX_METRIKA_ID, "hit", url, {
    title: document.title,
    referer: document.referrer,
  });
}

/** Sends virtual pageviews on React Router navigation (SPA). */
export function YandexMetrika() {
  const location = useLocation();
  const isFirstNavigation = useRef(true);

  useEffect(() => {
    if (isFirstNavigation.current) {
      isFirstNavigation.current = false;
      return;
    }

    trackPageView(
      getPageUrl(location.pathname, location.search, location.hash),
    );
  }, [location.pathname, location.search, location.hash]);

  return null;
}
