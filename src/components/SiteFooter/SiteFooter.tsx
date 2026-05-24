import { Link } from "react-router-dom";
import "./SiteFooter.css";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav className="site-footer__nav" aria-label="Навигация по сайту">
        <Link to="/" className="site-footer__link">
          Главная
        </Link>
        <Link to="/rules" className="site-footer__link">
          Правила
        </Link>
        <Link to="/about" className="site-footer__link">
          Об игре
        </Link>
      </nav>
      <p className="site-footer__text">
        Этот сайт разработан для моей любимой дочери Марии. Автор: Дмитрий
        Сейцман. &copy; 2026
      </p>
    </footer>
  );
}
