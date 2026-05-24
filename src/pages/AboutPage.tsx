import { Link } from "react-router-dom";
import { Seo } from "../components/Seo/Seo";
import { SITE_URL } from "../constants/seo";
import "./SeoPage.css";

export function AboutPage() {
  return (
    <div className="seo-page page-enter">
      <Seo
        title="Об игре Крестики-нолики онлайн"
        description="Крестики-нолики онлайн — бесплатная браузерная игра без регистрации. Играйте с компьютером, другом по ссылке или случайным соперником."
        canonical={`${SITE_URL}/about`}
      />

      <main className="seo-page__content">
        <article className="seo-page__card">
          <h1 className="seo-page__title">Крестики-нолики онлайн</h1>
          <p className="seo-page__intro">
            Крестики-нолики онлайн — бесплатная браузерная игра, в которую можно
            играть без регистрации. Вы можете выбрать режим с компьютером,
            создать приглашение для друга или найти случайного соперника онлайн.
          </p>

          <section className="seo-page__section">
            <h2>Бесплатно и без регистрации</h2>
            <p>
              Не нужно создавать аккаунт или устанавливать приложение. Откройте
              сайт в браузере и начните партию за несколько секунд.
            </p>
          </section>

          <section className="seo-page__section">
            <h2>Для детей и взрослых</h2>
            <p>
              Игра понятна с первого хода, подходит для семейного досуга и
              коротких онлайн-партий с друзьями.
            </p>
          </section>

          <section className="seo-page__section">
            <h2>На телефоне, планшете и компьютере</h2>
            <p>
              Сайт адаптирован под мобильные устройства и десктоп. Можно играть
              дома, в дороге или на перерыве.
            </p>
          </section>

          <section className="seo-page__section">
            <h2>Режимы и размеры поля</h2>
            <ul>
              <li>Игра с компьютером</li>
              <li>Игра с другом по ссылке</li>
              <li>Игра со случайным игроком</li>
              <li>Поля 3×3, 4×4, 5×5 и 6×6</li>
            </ul>
          </section>

          <div className="seo-page__actions">
            <Link to="/" className="btn btn--primary">
              Начать игру
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
