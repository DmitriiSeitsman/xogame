import { Seo } from "../components/Seo/Seo";
import { SITE_URL } from "../constants/seo";
import "./SeoPage.css";

const TELEGRAM_URL = "https://t.me/dseitsman";
const DEVELOPER_EMAIL = "seytsman@gmail.com";
const EMAIL_SUBJECT = "КРЕСТИКИ-НОЛИКИ";
const MAILTO_LINK = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;

export function ContactsPage() {
  return (
    <div className="seo-page page-enter">
      <Seo
        title="Контакты — Крестики-нолики онлайн"
        description="Связаться с разработчиком игры Крестики-нолики онлайн: Telegram или email."
        canonical={`${SITE_URL}/contacts`}
      />

      <main className="seo-page__content">
        <article className="seo-page__card">
          <h1 className="seo-page__title">Контакты</h1>
          <p className="seo-page__intro">
            Если у вас есть вопрос, предложение или вы нашли ошибку — напишите
            разработчику. Ответим, когда сможем.
          </p>

          <section className="seo-page__section">
            <h2>Связаться с разработчиком</h2>
            <p>
              Выберите удобный способ связи: Telegram или электронная почта.
            </p>

            <div className="seo-page__contact-actions">
              <a
                href={TELEGRAM_URL}
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Написать в Telegram
              </a>
              <a href={MAILTO_LINK} className="btn btn--secondary">
                Написать на почту
              </a>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
