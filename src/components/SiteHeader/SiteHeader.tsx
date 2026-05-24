import { Link, useLocation } from "react-router-dom";
import "./SiteHeader.css";

const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: "/", label: "Главная", end: true },
  { to: "/rules", label: "Правила" },
  { to: "/about", label: "Об игре" },
  { to: "/contacts", label: "Контакты" },
];

export function SiteHeader() {
  const { pathname } = useLocation();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <nav className="site-header__nav" aria-label="Навигация по сайту">
          {NAV_ITEMS.map((item) => {
            const isActive = item.end
              ? pathname === item.to
              : pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`site-header__link${
                  isActive ? " site-header__link--active" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
