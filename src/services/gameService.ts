import type { BoardSize, Game } from "../types/game";
import type { SymbolTheme } from "../types/gameTheme";
import { apiGet, apiPost } from "./apiClient";

export { subscribeToGame } from "./realtimeClient";

const BOARD_SIZES: BoardSize[] = [3, 4, 5, 6];

function parseQueueCounts(payload: unknown): Record<BoardSize, number> {
  const source =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return BOARD_SIZES.reduce<Record<BoardSize, number>>((counts, size) => {
    const value = source[String(size)];
    counts[size] =
      typeof value === "number" && Number.isFinite(value)
        ? Math.max(0, Math.floor(value))
        : 0;
    return counts;
  }, { 3: 0, 4: 0, 5: 0, 6: 0 });
}

// The backend's GameDTO is encoded with the exact same snake_case field
// names this Game type already expects (see XOGameBackend's GameDTO.swift),
// so this is mostly a pass-through — kept mainly as a defensive boundary in
// case the API ever returns extra/unexpected fields.
function mapGame(row: Record<string, unknown>): Game {
  return {
    id: row.id as string,
    mode: row.mode as Game["mode"],
    status: row.status as Game["status"],
    board_size: row.board_size as BoardSize,
    win_length: row.win_length as Game["win_length"],
    invite_code: (row.invite_code as string | null) ?? null,
    player_x_token: row.player_x_token as string,
    player_o_token: (row.player_o_token as string | null) ?? null,
    player_x_name: (row.player_x_name as string | null) ?? null,
    player_x_age:
      row.player_x_age == null ? null : (row.player_x_age as number),
    player_o_name: (row.player_o_name as string | null) ?? null,
    player_o_age:
      row.player_o_age == null ? null : (row.player_o_age as number),
    current_turn: row.current_turn as Game["current_turn"],
    board: row.board as Game["board"],
    winner: (row.winner as Game["winner"]) ?? null,
    rematch_status: (row.rematch_status as Game["rematch_status"]) ?? null,
    symbol_theme: (row.symbol_theme as SymbolTheme | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function createFriendGame(params: {
  playerToken: string;
  boardSize: BoardSize;
  playerName: string;
  playerAge?: number | null;
  symbolTheme?: SymbolTheme;
}): Promise<Game> {
  const data = await apiPost<Record<string, unknown>>("/games/friend", {
    playerToken: params.playerToken,
    boardSize: params.boardSize,
    playerName: params.playerName,
    playerAge: params.playerAge ?? null,
    symbolTheme: params.symbolTheme ?? "classic",
  });
  return mapGame(data);
}

export async function joinFriendGame(params: {
  playerToken: string;
  inviteCode: string;
  playerName: string;
  playerAge?: number | null;
}): Promise<Game> {
  const data = await apiPost<Record<string, unknown>>("/games/friend/join", {
    playerToken: params.playerToken,
    inviteCode: params.inviteCode.toUpperCase(),
    playerName: params.playerName,
    playerAge: params.playerAge ?? null,
  });
  return mapGame(data);
}

export async function getMatchmakingQueueCounts(): Promise<
  Record<BoardSize, number>
> {
  const data = await apiGet<unknown>("/games/random/queue-counts");
  return parseQueueCounts(data);
}

export async function joinRandomMatchmaking(params: {
  playerToken: string;
  boardSize: BoardSize;
  playerName: string;
  playerAge?: number | null;
}): Promise<Game> {
  const data = await apiPost<Record<string, unknown>>("/games/random/join", {
    playerToken: params.playerToken,
    boardSize: params.boardSize,
    playerName: params.playerName,
    playerAge: params.playerAge ?? null,
  });
  return mapGame(data);
}

export async function heartbeatRandomMatchmaking(params: {
  playerToken: string;
}): Promise<Game> {
  const data = await apiPost<Record<string, unknown>>("/games/random/heartbeat", {
    playerToken: params.playerToken,
  });
  return mapGame(data);
}

export async function leaveRandomMatchmaking(params: {
  playerToken: string;
  gameId: string;
}): Promise<Game> {
  const data = await apiPost<Record<string, unknown>>("/games/random/leave", {
    playerToken: params.playerToken,
    gameId: params.gameId,
  });
  return mapGame(data);
}

export async function cancelRandomSearch(params: {
  playerToken: string;
  gameId: string;
}): Promise<Game> {
  // The backend consolidates cancel/leave into the same function (they were
  // already the same thing as of xogame's 005_matchmaking_queue.sql).
  const data = await apiPost<Record<string, unknown>>("/games/random/leave", {
    playerToken: params.playerToken,
    gameId: params.gameId,
  });
  return mapGame(data);
}

export async function offerFriendRematch(params: {
  playerToken: string;
  gameId: string;
}): Promise<Game> {
  const data = await apiPost<Record<string, unknown>>(
    `/games/${params.gameId}/rematch/offer`,
    { playerToken: params.playerToken },
  );
  return mapGame(data);
}

export async function acceptFriendRematch(params: {
  playerToken: string;
  gameId: string;
}): Promise<Game> {
  const data = await apiPost<Record<string, unknown>>(
    `/games/${params.gameId}/rematch/accept`,
    { playerToken: params.playerToken },
  );
  return mapGame(data);
}

export async function declineFriendRematch(params: {
  playerToken: string;
  gameId: string;
}): Promise<Game> {
  const data = await apiPost<Record<string, unknown>>(
    `/games/${params.gameId}/rematch/decline`,
    { playerToken: params.playerToken },
  );
  return mapGame(data);
}

export async function makeMove(params: {
  playerToken: string;
  gameId: string;
  cellIndex: number;
}): Promise<Game> {
  const data = await apiPost<Record<string, unknown>>(
    `/games/${params.gameId}/move`,
    { playerToken: params.playerToken, cellIndex: params.cellIndex },
  );
  return mapGame(data);
}

export async function getGameById(gameId: string): Promise<Game> {
  const data = await apiGet<Record<string, unknown>>(`/games/${gameId}`);
  return mapGame(data);
}
