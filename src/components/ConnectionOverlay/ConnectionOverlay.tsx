import { createPortal } from "react-dom";
import { useI18n } from "../../i18n/useI18n";
import "./ConnectionOverlay.css";

/**
 * Full-screen "we lost our own connection" overlay — shown while
 * realtimeClient's socket is closed and retrying with backoff. Unlike
 * OpponentPresenceNotice this has no actions: there's nothing useful to do
 * but wait for the automatic reconnect (see realtimeClient's
 * onConnectionStateChange/onReconnected wiring in GamePage).
 */
export function ConnectionOverlay({ visible }: { visible: boolean }) {
  const { t } = useI18n();

  if (!visible) {
    return null;
  }

  return createPortal(
    <div className="connection-overlay" role="status" aria-live="polite">
      <div className="connection-overlay__panel">
        <span className="connection-overlay__spinner" aria-hidden="true" />
        <p className="connection-overlay__title">{t.connection.title}</p>
        <p className="connection-overlay__subtitle">{t.connection.subtitle}</p>
      </div>
    </div>,
    document.body,
  );
}
