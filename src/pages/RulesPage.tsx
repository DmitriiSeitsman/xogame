import { Link } from "react-router-dom";
import { Seo } from "../components/Seo/Seo";
import { getPageSeo } from "../constants/seo";
import { useI18n } from "../i18n/useI18n";
import "./SeoPage.css";

export function RulesPage() {
  const { t, lang, path } = useI18n();
  const seo = getPageSeo("/rules", lang);

  return (
    <div className="seo-page page-enter">
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        language={lang}
        route="/rules"
      />

      <main className="seo-page__content">
        <article className="seo-page__card">
          <h1 className="seo-page__title">{t.rules.heading}</h1>
          <p className="seo-page__intro">{t.rules.intro}</p>

          <section className="seo-page__section">
            <h2>{t.rules.sizesHeading}</h2>
            <ul>
              {t.rules.sizes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="seo-page__section">
            <h2>{t.rules.winHeading}</h2>
            <ul>
              {t.rules.winConditions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="seo-page__section">
            <h2>{t.rules.modesHeading}</h2>
            <ul>
              <li>
                <strong>{t.rules.modeComputer}</strong> — {t.rules.modeComputerText}
              </li>
              <li>
                <strong>{t.rules.modeFriend}</strong> — {t.rules.modeFriendText}
              </li>
              <li>
                <strong>{t.rules.modeRandom}</strong> — {t.rules.modeRandomText}
              </li>
            </ul>
          </section>

          <div className="seo-page__actions">
            <Link to={path("/")} className="btn btn--primary">
              {t.rules.startGame}
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
