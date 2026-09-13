import { Link } from "react-router-dom";
import { Seo } from "../components/Seo/Seo";
import { getPageSeo } from "../constants/seo";
import { useI18n } from "../i18n/useI18n";
import "./SeoPage.css";

/**
 * "как выиграть в крестики нолики" is the one high-volume informational
 * query in the niche (~1.8k/mo in Wordstat), and informational pages rank
 * far more easily than the game itself. The FAQ copy comes from
 * seoPages.json so the prerender step can emit matching FAQPage markup
 * without duplicating the text.
 */
export function StrategyPage() {
  const { t, lang, path } = useI18n();
  const seo = getPageSeo("/strategy", lang);

  return (
    <div className="seo-page page-enter">
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        language={lang}
        route="/strategy"
      />

      <main className="seo-page__content">
        <article className="seo-page__card">
          <h1 className="seo-page__title">{t.strategy.heading}</h1>
          <p className="seo-page__intro">{t.strategy.intro}</p>

          <section className="seo-page__section">
            <h2>{t.strategy.firstMoveHeading}</h2>
            <p>{t.strategy.firstMoveText}</p>
          </section>

          <section className="seo-page__section">
            <h2>{t.strategy.forkHeading}</h2>
            <p>{t.strategy.forkText}</p>
          </section>

          <section className="seo-page__section">
            <h2>{t.strategy.priorityHeading}</h2>
            <ol className="seo-page__ordered">
              {t.strategy.priority.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p className="seo-page__note">{t.strategy.priorityNote}</p>
          </section>

          <section className="seo-page__section">
            <h2>{t.strategy.bigBoardsHeading}</h2>
            <p>{t.strategy.bigBoardsText}</p>
          </section>

          <section className="seo-page__section">
            <h2>{t.strategy.botHeading}</h2>
            <p>{t.strategy.botText}</p>
          </section>

          {seo.faq && seo.faq.length > 0 && (
            <section className="seo-page__section">
              <h2>{t.strategy.faqHeading}</h2>
              <div className="seo-page__faq">
                {seo.faq.map((entry) => (
                  <details key={entry.q} className="seo-page__faq-item">
                    <summary>{entry.q}</summary>
                    <p>{entry.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="seo-page__actions">
            <Link to={path("/")} className="btn btn--primary">
              {t.strategy.startGame}
            </Link>
            <Link to={path("/rules")} className="seo-page__inline-link">
              {t.strategy.rulesLink}
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
