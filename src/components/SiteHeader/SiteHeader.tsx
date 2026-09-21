import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import type { Dictionary } from "../../i18n/dictionaries/ru";
import { stripLanguagePrefix } from "../../i18n/language";
import { useI18n } from "../../i18n/useI18n";
import "./SiteHeader.css";

type NavItem = { to: string; label: string; end?: boolean };

/** Routes are language-agnostic here; `path()` prefixes them for the
 * active language when the links are rendered. */
function getNavItems(t: Dictionary): NavItem[] {
  return [
    { to: "/", label: t.nav.home, end: true },
    { to: "/rules", label: t.nav.rules },
    { to: "/about", label: t.nav.about },
    { to: "/contacts", label: t.nav.contacts },
    { to: "/privacy", label: t.nav.privacy },
  ];
}

const MOBILE_MENU_MQ = "(max-width: 767px)";

/** Compared against the prefix-stripped path so /en/rules highlights the
 * same nav item as /rules. */
function isNavItemActive(pathname: string, item: NavItem) {
  const route = stripLanguagePrefix(pathname);
  return item.end ? route === item.to : route.startsWith(item.to);
}

export function SiteHeader() {
  const { t, path } = useI18n();
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
    getNavItems(t).map((item) => {
      const isActive = isNavItemActive(pathname, item);

      return (
        <Link
          key={item.to}
          to={path(item.to)}
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
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
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
          aria-label={t.nav.siteNavigation}
        >
          <div className="site-header__links">
            {renderNavLinks("site-header__link")}
          </div>
          <LanguageSwitcher className="language-switcher--header" />
          <ThemeToggle className="theme-toggle--header" />
        </nav>

        <LanguageSwitcher className="language-switcher--mobile-bar" />
        <ThemeToggle className="theme-toggle--mobile-bar" />
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
          aria-label={t.nav.closeMenu}
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeMenu}
        />

        <nav
          id={menuId}
          className="site-header__sheet"
          aria-label={t.nav.siteNavigation}
        >
          <div className="site-header__sheet-handle" aria-hidden="true" />
          <p className="site-header__sheet-title">{t.nav.menu}</p>
          <div className="site-header__sheet-links">
            {renderNavLinks("site-header__sheet-link")}
          </div>
          <LanguageSwitcher
            className="language-switcher--sheet"
            onNavigate={closeMenu}
          />
          <ThemeToggle className="theme-toggle--sheet" />
        </nav>
      </div>
    </header>
  );
}
