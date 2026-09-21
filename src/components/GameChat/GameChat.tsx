import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/useI18n";
import type { ChatMessage } from "../../services/gameService";
import "./GameChat.css";

const MAX_MESSAGE_LENGTH = 300;

type GameChatProps = {
  messages: ChatMessage[];
  myToken: string;
  /** Label shown above my own bubbles, e.g. "Дмитрий, 40 лет". Omitted if empty. */
  myLabel?: string | null;
  /** Label shown above the opponent's bubbles. Omitted if empty. */
  opponentLabel?: string | null;
  onSend: (text: string) => void;
  /** Reports open/closed transitions so the page can make room for the
   * panel on mobile (it's tall enough to cover the board otherwise). Chat
   * keeps owning its own open state — this is just an outward mirror. */
  onOpenChange?: (open: boolean) => void;
};

function formatTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

/**
 * Small floating chat for "live opponent" modes (friend / random) — reuses
 * the same WebSocket the game already opens for realtime board updates
 * (see services/realtimeClient.ts), so no extra connection is made.
 * Messages live only in memory for the current page session: nothing is
 * persisted, so a refresh clears the history (kept simple on purpose).
 */
export function GameChat({
  messages,
  myToken,
  myLabel,
  opponentLabel,
  onSend,
  onOpenChange,
}: GameChatProps) {
  const { t, lang } = useI18n();
  const timeLocale = lang === "ru" ? "ru-RU" : "en-GB";
  const [open, setOpenState] = useState(false);

  const setOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    setOpenState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      onOpenChange?.(next);
      return next;
    });
  };
  const [draft, setDraft] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const seenCountRef = useRef(0);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
      seenCountRef.current = messages.length;
    } else if (messages.length > seenCountRef.current) {
      setUnreadCount(messages.length - seenCountRef.current);
    }
  }, [messages.length, open]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  };

  return (
    <div className="game-chat ym-hide-content">
      {open && (
        <div
          className="game-chat__panel page-enter"
          role="log"
          aria-label={t.chat.label}
        >
          <div className="game-chat__header">
            <span>{t.chat.title}</span>
            <button
              type="button"
              className="game-chat__close"
              onClick={() => setOpen(false)}
              aria-label={t.chat.close}
            >
              ✕
            </button>
          </div>
          <div className="game-chat__messages" ref={listRef}>
            {messages.length === 0 && (
              <p className="game-chat__empty">{t.chat.empty}</p>
            )}
            {messages.map((message, index) => {
              const isMine =
                message.senderToken.toLowerCase() === myToken.toLowerCase();
              const label = isMine ? myLabel : opponentLabel;
              const previousIsMine =
                index > 0 &&
                messages[index - 1].senderToken.toLowerCase() ===
                  message.senderToken.toLowerCase();

              return (
                <div
                  key={index}
                  className={`game-chat__group${isMine ? " game-chat__group--mine" : ""}`}
                >
                  {label && !previousIsMine && (
                    <span className="game-chat__sender">{label}</span>
                  )}
                  <div
                    className={`game-chat__bubble${isMine ? " game-chat__bubble--mine" : ""}`}
                  >
                    <span className="game-chat__text">{message.text}</span>
                    <span className="game-chat__time">
                      {formatTime(message.sentAt, timeLocale)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <form className="game-chat__form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="game-chat__input"
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder={t.chat.inputPlaceholder}
              maxLength={MAX_MESSAGE_LENGTH}
              aria-label={t.chat.inputLabel}
            />
            <button
              type="submit"
              className="game-chat__send"
              disabled={!draft.trim()}
              aria-label={t.chat.send}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="game-chat__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? t.chat.close : t.chat.open}
      >
        💬
        {!open && unreadCount > 0 && (
          <span className="game-chat__badge">{unreadCount}</span>
        )}
      </button>
    </div>
  );
}
