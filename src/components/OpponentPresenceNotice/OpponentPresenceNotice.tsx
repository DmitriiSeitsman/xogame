import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./OpponentPresenceNotice.css";

type OpponentPresenceNoticeProps = {
  /** null = presence unknown yet (e.g. right after subscribing before the
   * server's snapshot arrives) — nothing is shown in that case. */
  online: boolean | null;
  opponentLabel?: string | null;
  onLeave: () => void;
};

/**
 * Shows a blocking dialog the moment the opponent's connection drops
 * ("подождать" / "выйти из игры", per the user's own framing of the
 * choice), then — once dismissed with "подождать" — steps down to a small
 * non-blocking banner so the board stays usable while we wait. Both reset
 * automatically the instant presence flips back to online.
 */
export function OpponentPresenceNotice({
  online,
  opponentLabel,
  onLeave,
}: OpponentPresenceNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (online !== false) {
      setDismissed(false);
    }
  }, [online]);

  if (online !== false) {
    return null;
  }

  const name = opponentLabel || "Соперник";

  if (!dismissed) {
    return createPortal(
      <div className="opponent-presence-dialog" role="presentation">
        <div className="opponent-presence-dialog__backdrop" aria-hidden="true" />
        <div
          className="opponent-presence-dialog__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="opponent-presence-dialog-title"
        >
          <p className="opponent-presence-dialog__icon" aria-hidden="true">
            📡
          </p>
          <h2
            id="opponent-presence-dialog-title"
            className="opponent-presence-dialog__title"
          >
            {name} отключился
          </h2>
          <p className="opponent-presence-dialog__description">
            Возможно, дело в связи — можно подождать немного, соперник может
            вернуться в игру.
          </p>
          <div className="opponent-presence-dialog__actions">
            <button type="button" className="btn btn--secondary" onClick={onLeave}>
              Выйти из игры
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setDismissed(true)}
            >
              Подождать
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div className="opponent-presence-banner" role="status">
      <span className="opponent-presence-banner__spinner" aria-hidden="true" />
      <span className="opponent-presence-banner__text">Ждём {name}…</span>
      <button
        type="button"
        className="opponent-presence-banner__leave"
        onClick={onLeave}
      >
        Выйти
      </button>
    </div>
  );
}
