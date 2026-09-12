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

type ServerMessage = {
  type: string;
  eventID?: string;
  gameID?: string;
  payload?: { game?: Game };
};

export function subscribeToGame(params: {
  gameId: string;
  onUpdate: (game: Game) => void;
  /** Called once after a fresh (re)connection succeeds — a good hook for
   * refetching the game via REST in case something was missed while the
   * socket was down. Optional; realtime is best-effort, not the source of
   * truth. */
  onReconnected?: () => void;
}): () => void {
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

      if (message.type !== "game.updated" || !message.payload?.game) {
        return;
      }
      if (rememberEventId(message.eventID)) {
        return;
      }
      params.onUpdate(message.payload.game);
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

  return () => {
    closedByCaller = true;
    clearTimers();
    socket?.close();
    socket = null;
  };
}
