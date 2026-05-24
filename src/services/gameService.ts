import type { BoardSize, Game } from "../types/game";
import { supabase } from "./supabaseClient";

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
    current_turn: row.current_turn as Game["current_turn"],
    board: row.board as Game["board"],
    winner: (row.winner as Game["winner"]) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function createFriendGame(params: {
  playerToken: string;
  boardSize: BoardSize;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("create_friend_game", {
    p_player_token: params.playerToken,
    p_board_size: params.boardSize,
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function joinFriendGame(params: {
  playerToken: string;
  inviteCode: string;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("join_friend_game", {
    p_player_token: params.playerToken,
    p_invite_code: params.inviteCode.toUpperCase(),
  });

  if (error) {
    throw error;
  }

  return mapGame(data as Record<string, unknown>);
}

export async function findOrCreateRandomGame(params: {
  playerToken: string;
  boardSize: BoardSize;
}): Promise<Game> {
  const { data, error } = await supabase.rpc("find_or_create_random_game", {
    p_player_token: params.playerToken,
    p_board_size: params.boardSize,
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
