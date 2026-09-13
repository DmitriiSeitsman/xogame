import { useI18n } from "../../i18n/useI18n";
import "./SiteFooter.css";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <p className="site-footer__text">{t.footer.text}</p>
    </footer>
  );
}
