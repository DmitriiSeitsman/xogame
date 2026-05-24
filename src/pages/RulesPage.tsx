import { Link } from "react-router-dom";
import { Seo } from "../components/Seo/Seo";
import { SITE_URL } from "../constants/seo";
import "./SeoPage.css";

export function RulesPage() {
  return (
    <div className="seo-page page-enter">
      <Seo
        title="Правила игры в крестики-нолики — поля 3×3, 4×4, 5×5 и 6×6"
        description="Узнай правила игры в крестики-нолики онлайн: как победить на полях 3×3, 4×4, 5×5 и 6×6, как играть с другом, компьютером или случайным игроком."
        canonical={`${SITE_URL}/rules`}
      />

      <main className="seo-page__content">
        <article className="seo-page__card">
          <h1 className="seo-page__title">Правила игры в крестики-нолики</h1>
          <p className="seo-page__intro">
            Крестики-нолики — игра, где игроки по очереди ставят свои символы на
            поле. Побеждает тот, кто первым соберёт нужное количество символов в
            ряд: по горизонтали, вертикали или диагонали.
          </p>

          <section className="seo-page__section">
            <h2>Размеры поля</h2>
            <ul>
              <li>3×3 — классическое поле из 9 клеток</li>
              <li>4×4 — поле из 16 клеток</li>
              <li>5×5 — поле из 25 клеток</li>
              <li>6×6 — поле из 36 клеток</li>
            </ul>
          </section>

          <section className="seo-page__section">
            <h2>Условия победы</h2>
            <ul>
              <li>На поле 3×3 нужно собрать 3 символа в ряд</li>
              <li>На поле 4×4 нужно собрать 4 символа в ряд</li>
              <li>На поле 5×5 нужно собрать 4 символа в ряд</li>
              <li>На поле 6×6 нужно собрать 4 символа в ряд</li>
            </ul>
          </section>

          <section className="seo-page__section">
            <h2>Режимы игры</h2>
            <ul>
              <li>
                <strong>С компьютером</strong> — тренируйтесь против бота без
                регистрации
              </li>
              <li>
                <strong>С другом</strong> — создайте ссылку-приглашение и
                отправьте её второму игроку
              </li>
              <li>
                <strong>Случайный игрок</strong> — найдите соперника онлайн
                через matchmaking
              </li>
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
