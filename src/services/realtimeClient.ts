import type { Game } from "../types/game";
import { getOrCreatePlayerToken } from "../utils/playerToken";

/**
 * Native WebSocket client for XOGameBackend's /ws/game — replaces Supabase
 * Realtime's `postgres_changes` subscription. One socket per active game
 * subscription (mirrors the old `channel(game:${gameId})` lifecycle), with
 * reconnect + backoff and eventID dedup, following the same reconnect
 * strategy already written up for JustTwoBackend's iOS client
 * (exponential backoff with jitter, resubscribe after reconnect, dedupe by
 * eventID, reconcile via REST after reconnect — here that reconciliation is
 * just re-fetching the game once the socket comes back up).
 */
const WS_URL: string =
  import.meta.env.VITE_WS_URL ?? "ws://localhost:8092/ws/game";

const PING_INTERVAL_MS = 20_000;
const MAX_BACKOFF_MS = 30_000;
const SEEN_EVENT_IDS_LIMIT = 50;
const MAX_CHAT_MESSAGE_LENGTH = 300;

export type ChatMessage = {
  senderToken: string;
  text: string;
  sentAt: string;
};

type ServerMessage = {
  type: string;
  eventID?: string;
  gameID?: string;
  payload?: { game?: Game };
  chat?: ChatMessage;
};

export type GameRealtimeHandle = {
  /** Tears down the socket and stops reconnecting. */
  close: () => void;
  /** Sends a chat message over the same socket, if it's currently open.
   * Silently no-ops when disconnected — chat is best-effort, same as the
   * rest of this realtime layer. */
  sendChatMessage: (text: string) => void;
};

export function subscribeToGame(params: {
  gameId: string;
  onUpdate: (game: Game) => void;
  /** Called for every `chat.message` event for this game (both the sender's
   * own echoed messages and the opponent's). Optional — omit if the caller
   * doesn't want chat. */
  onChatMessage?: (message: ChatMessage) => void;
  /** Called once after a fresh (re)connection succeeds — a good hook for
   * refetching the game via REST in case something was missed while the
   * socket was down. Optional; realtime is best-effort, not the source of
   * truth. */
  onReconnected?: () => void;
}): GameRealtimeHandle {
  const playerToken = getOrCreatePlayerToken();
  const seenEventIds: string[] = [];

  let socket: WebSocket | null = null;
  let closedByCaller = false;
  let reconnectAttempt = 0;
  let reconnectTimer: number | undefined;
  let pingTimer: number | undefined;
  let hasConnectedBefore = false;

  const rememberEventId = (eventID: string | undefined): boolean => {
    if (!eventID) return false;
    if (seenEventIds.includes(eventID)) return true;
    seenEventIds.push(eventID);
    if (seenEventIds.length > SEEN_EVENT_IDS_LIMIT) {
      seenEventIds.shift();
    }
    return false;
  };

  const clearTimers = () => {
    if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
    if (pingTimer !== undefined) window.clearInterval(pingTimer);
  };

  const scheduleReconnect = () => {
    reconnectAttempt += 1;
    const backoff = Math.min(MAX_BACKOFF_MS, 500 * 2 ** reconnectAttempt);
    const jitter = Math.random() * 250;
    reconnectTimer = window.setTimeout(connect, backoff + jitter);
  };

  function connect() {
    if (closedByCaller) return;

    const url = `${WS_URL}?token=${encodeURIComponent(playerToken)}`;
    socket = new WebSocket(url);

    socket.addEventListener("open", () => {
      reconnectAttempt = 0;
      socket?.send(JSON.stringify({ type: "subscribe.game", gameID: params.gameId }));

      pingTimer = window.setInterval(() => {
        socket?.send(JSON.stringify({ type: "ping" }));
      }, PING_INTERVAL_MS);

      if (hasConnectedBefore) {
        params.onReconnected?.();
      }
      hasConnectedBefore = true;
    });

    socket.addEventListener("message", (event) => {
      let message: ServerMessage;
      try {
        message = JSON.parse(event.data as string) as ServerMessage;
      } catch {
        return;
      }

      if (message.type === "game.updated" && message.payload?.game) {
        if (rememberEventId(message.eventID)) return;
        params.onUpdate(message.payload.game);
        return;
      }

      if (message.type === "chat.message" && message.chat) {
        if (rememberEventId(message.eventID)) return;
        params.onChatMessage?.(message.chat);
      }
    });

    socket.addEventListener("close", () => {
      if (pingTimer !== undefined) window.clearInterval(pingTimer);
      if (closedByCaller) return;
      scheduleReconnect();
    });

    socket.addEventListener("error", () => {
      socket?.close();
    });
  }

  connect();

  const sendChatMessage = (text: string) => {
    const trimmed = text.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH);
    if (!trimmed || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(
      JSON.stringify({ type: "chat.send", gameID: params.gameId, text: trimmed }),
    );
  };

  const close = () => {
    closedByCaller = true;
    clearTimers();
    socket?.close();
    socket = null;
  };

  return { close, sendChatMessage };
}
