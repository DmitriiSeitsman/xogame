import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./SiteHeader.css";

const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: "/", label: "Главная", end: true },
  { to: "/rules", label: "Правила" },
  { to: "/about", label: "Об игре" },
  { to: "/contacts", label: "Контакты" },
];

const MOBILE_MENU_MQ = "(max-width: 767px)";

function isNavItemActive(pathname: string, item: (typeof NAV_ITEMS)[number]) {
  return item.end ? pathname === item.to : pathname.startsWith(item.to);
}

export function SiteHeader() {
  const { pathname } = useLocation();
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMenuOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const mediaQuery = window.matchMedia(MOBILE_MENU_MQ);
    const previousOverflow = document.body.style.overflow;

    const syncBodyScroll = () => {
      if (mediaQuery.matches) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = previousOverflow;
        setMenuOpen(false);
      }
    };

    syncBodyScroll();
    mediaQuery.addEventListener("change", syncBodyScroll);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      mediaQuery.removeEventListener("change", syncBodyScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const renderNavLinks = (linkClassName: string) =>
    NAV_ITEMS.map((item) => {
      const isActive = isNavItemActive(pathname, item);

      return (
        <Link
          key={item.to}
          to={item.to}
          className={`${linkClassName}${
            isActive ? ` ${linkClassName}--active` : ""
          }`}
          aria-current={isActive ? "page" : undefined}
          onClick={closeMenu}
        >
          {item.label}
        </Link>
      );
    });

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button
          type="button"
          className={`site-header__menu-toggle${
            menuOpen ? " site-header__menu-toggle--open" : ""
          }`}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="site-header__menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <nav
          className="site-header__nav site-header__nav--desktop"
          aria-label="Навигация по сайту"
        >
          {renderNavLinks("site-header__link")}
        </nav>
      </div>

      <div
        className={`site-header__mobile-menu${
          menuOpen ? " site-header__mobile-menu--open" : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="site-header__backdrop"
          aria-label="Закрыть меню"
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeMenu}
        />

        <nav
          id={menuId}
          className="site-header__sheet"
          aria-label="Навигация по сайту"
        >
          <div className="site-header__sheet-handle" aria-hidden="true" />
          <p className="site-header__sheet-title">Меню</p>
          <div className="site-header__sheet-links">
            {renderNavLinks("site-header__sheet-link")}
          </div>
        </nav>
      </div>
    </header>
  );
}
