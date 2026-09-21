import { Link } from "react-router-dom";
import { useAnalyticsConsent } from "../../hooks/useAnalyticsConsent";
import { useI18n } from "../../i18n/useI18n";
import { setAnalyticsConsent } from "../../utils/analyticsConsent";
import "./CookieConsent.css";

/**
 * Asks once whether Yandex Metrika may run. Until the visitor answers,
 * Metrika isn't loaded at all (see index.html), so ignoring the banner is
 * the same as declining. The answer can be changed on the privacy page.
 */
export function CookieConsent() {
  const { t, path } = useI18n();
  const consent = useAnalyticsConsent();

  if (consent !== null) {
    return null;
  }

  return (
    <section className="cookie-consent" role="region" aria-label={t.cookieBanner.label}>
      <p className="cookie-consent__text">
        {t.cookieBanner.text}{" "}
        <Link to={path("/privacy")} className="cookie-consent__link">
          {t.cookieBanner.more}
        </Link>
      </p>
      <div className="cookie-consent__actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => setAnalyticsConsent("denied")}
        >
          {t.cookieBanner.decline}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setAnalyticsConsent("granted")}
        >
          {t.cookieBanner.accept}
        </button>
      </div>
    </section>
  );
}
