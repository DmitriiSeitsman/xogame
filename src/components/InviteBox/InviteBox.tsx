import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/useI18n";
import {
  buildInviteLink,
  copyInviteCode,
  copyInviteLink,
  shareInviteLink,
} from "../../utils/inviteCode";
import "./InviteBox.css";

type InviteBoxProps = {
  inviteCode: string;
};

type Feedback = "code" | "link" | "shareFailed";

const FEEDBACK_MS = 2000;

/**
 * Just the invite itself — code, link and the ways to pass them on. The
 * "waiting for your friend" heading and hint live in the page's status bar
 * above, so this card deliberately doesn't repeat them.
 *
 * Feedback shows on the control that was used (a tick on the code's copy
 * button, the new label on the link button) rather than as a line of text
 * under the card, which either jumped the layout or, with space reserved
 * for it, left an empty strip at the bottom. A visually hidden live region
 * still announces it for screen readers.
 */
export function InviteBox({ inviteCode }: InviteBoxProps) {
  const { t, lang } = useI18n();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = (kind: Feedback) => {
    setFeedback(kind);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFeedback(null), FEEDBACK_MS);
  };

  const handleCopyCode = async () => {
    await copyInviteCode(inviteCode);
    flash("code");
  };

  const handleCopyLink = async () => {
    await copyInviteLink(inviteCode, lang);
    flash("link");
  };

  const handleShare = async () => {
    try {
      await shareInviteLink(t, inviteCode, lang);
    } catch {
      flash("shareFailed");
    }
  };

  const announcement =
    feedback === "code"
      ? t.invite.codeCopied
      : feedback === "link"
        ? t.invite.linkCopied
        : feedback === "shareFailed"
          ? t.invite.shareFailed
          : "";

  return (
    <div className="invite-box">
      <div className="invite-box__code">
        <span className="invite-box__code-text">{inviteCode}</span>
        <button
          type="button"
          className={`invite-box__code-copy${
            feedback === "code" ? " invite-box__code-copy--done" : ""
          }`}
          onClick={handleCopyCode}
          aria-label={t.invite.copyCode}
          title={t.invite.copyCode}
        >
          {feedback === "code" ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
              <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
            </svg>
          )}
        </button>
      </div>

      <div className="invite-box__link-wrap">
        <div className="invite-box__link">
          {buildInviteLink(inviteCode, lang)}
        </div>
      </div>

      <div className="invite-box__actions">
        <button
          type="button"
          className={`btn btn--secondary${
            feedback === "link" ? " invite-box__action--done" : ""
          }`}
          onClick={handleCopyLink}
        >
          {feedback === "link" ? t.invite.linkCopied : t.invite.copyLink}
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleShare}>
          {feedback === "shareFailed" ? t.invite.shareFailed : t.invite.share}
        </button>
      </div>

      <p className="invite-box__sr-status" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
