import { useState } from "react";
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
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2000);
  };

  const handleCopyLink = async () => {
    await copyInviteLink(inviteCode);
    showMessage("Ссылка скопирована");
  };

  const handleShare = async () => {
    try {
      await shareInviteLink(inviteCode);
    } catch {
      showMessage("Не удалось поделиться");
    }
  };

  const handleCopyCode = async () => {
    await copyInviteCode(inviteCode);
    showMessage("Код скопирован");
  };

  return (
    <div className="invite-box">
      <p className="invite-box__title">Ждём друга</p>
      <p className="invite-box__hint">
        Отправьте ссылку или код приглашения второму игроку
      </p>

      <div className="invite-box__code">{inviteCode}</div>
      <div className="invite-box__link-wrap">
        <div className="invite-box__link">{buildInviteLink(inviteCode)}</div>
      </div>

      <div className="invite-box__actions">
        <button type="button" className="btn btn--secondary" onClick={handleCopyLink}>
          Копировать ссылку
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleShare}>
          Поделиться
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleCopyCode}>
          Копировать код
        </button>
      </div>

      {message && <p className="invite-box__message">{message}</p>}
    </div>
  );
}
