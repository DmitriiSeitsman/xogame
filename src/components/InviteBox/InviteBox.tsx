import { useState } from "react";
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

export function InviteBox({ inviteCode }: InviteBoxProps) {
  const { t, lang } = useI18n();
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2000);
  };

  const handleCopyLink = async () => {
    await copyInviteLink(inviteCode, lang);
    showMessage(t.invite.linkCopied);
  };

  const handleShare = async () => {
    try {
      await shareInviteLink(t, inviteCode, lang);
    } catch {
      showMessage(t.invite.shareFailed);
    }
  };

  const handleCopyCode = async () => {
    await copyInviteCode(inviteCode);
    showMessage(t.invite.codeCopied);
  };

  return (
    <div className="invite-box">
      <p className="invite-box__title">{t.invite.title}</p>
      <p className="invite-box__hint">{t.invite.hint}</p>

      <div className="invite-box__code">{inviteCode}</div>
      <div className="invite-box__link-wrap">
        <div className="invite-box__link">
          {buildInviteLink(inviteCode, lang)}
        </div>
      </div>

      <div className="invite-box__actions">
        <button type="button" className="btn btn--secondary" onClick={handleCopyLink}>
          {t.invite.copyLink}
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleShare}>
          {t.invite.share}
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleCopyCode}>
          {t.invite.copyCode}
        </button>
      </div>

      {message && <p className="invite-box__message">{message}</p>}
    </div>
  );
}
