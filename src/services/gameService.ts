import type { BoardSize, Game } from "../types/game";
import { supabase } from "./supabaseClient";

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
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function createFriendGame(params: {
  playerToken: string;
  boardSize: BoardSize;
  playerName: string;
  playerAge?: number | null;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("create_friend_game", {
    p_player_token: params.playerToken,
    p_board_size: params.boardSize,
    p_player_name: params.playerName,
    p_player_age: params.playerAge ?? null,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function joinFriendGame(params: {
  playerToken: string;
  inviteCode: string;
  playerName: string;
  playerAge?: number | null;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("join_friend_game", {
    p_player_token: params.playerToken,
    p_invite_code: params.inviteCode.toUpperCase(),
    p_player_name: params.playerName,
    p_player_age: params.playerAge ?? null,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function getMatchmakingQueueCounts(): Promise<
  Record<BoardSize, number>
> {
  const { data, error } = await supabase.rpc("get_matchmaking_queue_counts");

  if (error) {
    throw error;
  }

  return parseQueueCounts(data);
}

export async function joinRandomMatchmaking(params: {
  playerToken: string;
  boardSize: BoardSize;
  playerName: string;
  playerAge?: number | null;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("join_random_matchmaking", {
    p_player_token: params.playerToken,
    p_board_size: params.boardSize,
    p_player_name: params.playerName,
    p_player_age: params.playerAge ?? null,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function heartbeatRandomMatchmaking(params: {
  playerToken: string;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("heartbeat_random_matchmaking", {
    p_player_token: params.playerToken,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function leaveRandomMatchmaking(params: {
  playerToken: string;
  gameId: string;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("leave_random_matchmaking", {
    p_player_token: params.playerToken,
    p_game_id: params.gameId,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function cancelRandomSearch(params: {
  playerToken: string;
  gameId: string;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("cancel_random_search", {
    p_player_token: params.playerToken,
    p_game_id: params.gameId,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function offerFriendRematch(params: {
  playerToken: string;
  gameId: string;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("offer_friend_rematch", {
    p_player_token: params.playerToken,
    p_game_id: params.gameId,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function acceptFriendRematch(params: {
  playerToken: string;
  gameId: string;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("accept_friend_rematch", {
    p_player_token: params.playerToken,
    p_game_id: params.gameId,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function declineFriendRematch(params: {
  playerToken: string;
  gameId: string;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("decline_friend_rematch", {
    p_player_token: params.playerToken,
    p_game_id: params.gameId,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function makeMove(params: {
  playerToken: string;
  gameId: string;
  cellIndex: number;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("make_move", {
    p_player_token: params.playerToken,
    p_game_id: params.gameId,
    p_cell_index: params.cellIndex,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function getGameById(gameId: string): Promise<Game> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export function subscribeToGame(params: {
  gameId: string;
  onUpdate: (game: Game) => void;
}): () => void {
  const channel = supabase
    .channel(`game:${params.gameId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "games",
        filter: `id=eq.${params.gameId}`,
      },
      (payload) => {
        params.onUpdate(mapGame(payload.new as Record<string, unknown>));
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
