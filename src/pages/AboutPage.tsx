import { Link } from "react-router-dom";
import { Seo } from "../components/Seo/Seo";
import { getPageSeo } from "../constants/seo";
import { useI18n } from "../i18n/useI18n";
import "./SeoPage.css";

export function AboutPage() {
  const { t, lang, path } = useI18n();
  const seo = getPageSeo("/about", lang);

  return (
    <div className="seo-page page-enter">
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        language={lang}
        route="/about"
      />

      <main className="seo-page__content">
        <article className="seo-page__card">
          <h1 className="seo-page__title">{t.about.heading}</h1>
          <p className="seo-page__intro">{t.about.intro}</p>

          <section className="seo-page__section">
            <h2>{t.about.freeHeading}</h2>
            <p>{t.about.freeText}</p>
          </section>

          <section className="seo-page__section">
            <h2>{t.about.familyHeading}</h2>
            <p>{t.about.familyText}</p>
          </section>

          <section className="seo-page__section">
            <h2>{t.about.devicesHeading}</h2>
            <p>{t.about.devicesText}</p>
          </section>

          <section className="seo-page__section">
            <h2>{t.about.modesHeading}</h2>
            <ul>
              {t.about.modes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <div className="seo-page__actions">
            <Link to={path("/")} className="btn btn--primary">
              {t.about.startGame}
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
