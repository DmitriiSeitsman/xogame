import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../../services/gameService";
import "./GameChat.css";

const MAX_MESSAGE_LENGTH = 300;

type GameChatProps = {
  messages: ChatMessage[];
  myToken: string;
  onSend: (text: string) => void;
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Small floating chat for "live opponent" modes (friend / random) — reuses
 * the same WebSocket the game already opens for realtime board updates
 * (see services/realtimeClient.ts), so no extra connection is made.
 * Messages live only in memory for the current page session: nothing is
 * persisted, so a refresh clears the history (kept simple on purpose).
 */
export function GameChat({ messages, myToken, onSend }: GameChatProps) {
  const [open, setOpen] = useState(false);
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
    <div className="game-chat">
      {open && (
        <div className="game-chat__panel page-enter" role="log" aria-label="Чат с соперником">
          <div className="game-chat__header">
            <span>Чат</span>
            <button
              type="button"
              className="game-chat__close"
              onClick={() => setOpen(false)}
              aria-label="Закрыть чат"
            >
              ✕
            </button>
          </div>
          <div className="game-chat__messages" ref={listRef}>
            {messages.length === 0 && (
              <p className="game-chat__empty">
                Пока тихо… напишите первым! 👋
              </p>
            )}
            {messages.map((message, index) => {
              const isMine = message.senderToken === myToken;
              return (
                <div
                  key={index}
                  className={`game-chat__bubble${isMine ? " game-chat__bubble--mine" : ""}`}
                >
                  <span className="game-chat__text">{message.text}</span>
                  <span className="game-chat__time">{formatTime(message.sentAt)}</span>
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
              placeholder="Сообщение…"
              maxLength={MAX_MESSAGE_LENGTH}
              aria-label="Текст сообщения"
            />
            <button
              type="submit"
              className="game-chat__send"
              disabled={!draft.trim()}
              aria-label="Отправить"
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
        aria-label={open ? "Закрыть чат" : "Открыть чат"}
      >
        💬
        {!open && unreadCount > 0 && (
          <span className="game-chat__badge">{unreadCount}</span>
        )}
      </button>
    </div>
  );
}
