import { Seo } from "../components/Seo/Seo";
import { getPageSeo } from "../constants/seo";
import { useI18n } from "../i18n/useI18n";
import "./SeoPage.css";

const TELEGRAM_URL = "https://t.me/dseitsman";
const DEVELOPER_EMAIL = "seytsman@gmail.com";

export function ContactsPage() {
  const { t, lang } = useI18n();
  const seo = getPageSeo("/contacts", lang);
  const mailtoLink = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(
    t.contacts.emailSubject,
  )}`;

  return (
    <div className="seo-page page-enter">
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        language={lang}
        route="/contacts"
      />

      <main className="seo-page__content">
        <article className="seo-page__card">
          <h1 className="seo-page__title">{t.contacts.heading}</h1>
          <p className="seo-page__intro">{t.contacts.intro}</p>

          <section className="seo-page__section">
            <h2>{t.contacts.sectionHeading}</h2>
            <p>{t.contacts.sectionText}</p>

            <div className="seo-page__contact-actions">
              <a
                href={TELEGRAM_URL}
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.contacts.telegram}
              </a>
              <a href={mailtoLink} className="btn btn--secondary">
                {t.contacts.email}
              </a>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
