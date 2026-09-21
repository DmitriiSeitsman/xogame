import { useState } from "react";
import { Seo } from "../components/Seo/Seo";
import { DEVELOPER_EMAIL, TELEGRAM_URL } from "../constants/contacts";
import { getPageSeo } from "../constants/seo";
import { useAnalyticsConsent } from "../hooks/useAnalyticsConsent";
import { useI18n } from "../i18n/useI18n";
import {
  setAnalyticsConsent,
  type AnalyticsConsent,
} from "../utils/analyticsConsent";
import "./SeoPage.css";

const RELOAD_DELAY_MS = 1500;
const PRIVACY_MAIL_SUBJECT = "xo-game";

/**
 * The retention periods quoted here are the ones enforced on the backend
 * (AddPlayerDataRetention, nginx log rotation) — change them together.
 */
export function PrivacyPage() {
  const { t, lang } = useI18n();
  const seo = getPageSeo("/privacy", lang);
  const consent = useAnalyticsConsent();
  const [reloading, setReloading] = useState(false);

  const choose = (next: AnalyticsConsent) => {
    if (setAnalyticsConsent(next)) {
      // Metrika was already running; only a reload stops it.
      setReloading(true);
      window.setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
    }
  };

  // The address is only assembled when the button is pressed, so it never
  // appears on the page or in its markup for scrapers to collect.
  const openMail = () => {
    window.location.href = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(
      PRIVACY_MAIL_SUBJECT,
    )}`;
  };

  const status =
    consent === "granted"
      ? t.privacy.consentGranted
      : consent === "denied"
        ? t.privacy.consentDenied
        : t.privacy.consentUnset;

  return (
    <div className="seo-page page-enter">
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        language={lang}
        route="/privacy"
      />

      <main className="seo-page__content">
        <article className="seo-page__card">
          <h1 className="seo-page__title">{t.privacy.heading}</h1>
          <p className="seo-page__intro">{t.privacy.intro}</p>
          <p className="seo-page__note">{t.privacy.updated}</p>

          {t.privacy.sections.map((section) => (
            <section key={section.heading} className="seo-page__section">
              <h2>{section.heading}</h2>
              {section.items.length > 0 && (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.links.map((link) => (
                <p key={link.href}>
                  <a
                    href={link.href}
                    className="seo-page__inline-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                </p>
              ))}
            </section>
          ))}

          <section className="seo-page__section" id="analytics">
            <h2>{t.privacy.consentHeading}</h2>
            <p role="status">{reloading ? t.privacy.reloading : status}</p>
            <div className="seo-page__actions seo-page__actions--tight">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => choose("granted")}
                disabled={reloading || consent === "granted"}
              >
                {t.privacy.allow}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => choose("denied")}
                disabled={reloading || consent === "denied"}
              >
                {t.privacy.deny}
              </button>
            </div>
          </section>

          <section className="seo-page__section">
            <h2>{t.privacy.contactsHeading}</h2>
            <div className="seo-page__contact-rows">
              <div className="seo-page__contact-row">
                <span>{t.privacy.emailLabel}</span>
                <button type="button" className="btn btn--secondary" onClick={openMail}>
                  {t.privacy.writeEmail}
                </button>
              </div>
              <div className="seo-page__contact-row">
                <span>{t.privacy.telegramLabel}</span>
                <a
                  href={TELEGRAM_URL}
                  className="btn btn--primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.privacy.contactTelegram}
                </a>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
