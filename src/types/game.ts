export type ComputerDifficulty = "easy" | "medium" | "hard";

export const COMPUTER_DIFFICULTIES: ComputerDifficulty[] = [
  "easy",
  "medium",
  "hard",
];

export type GameMode = "computer" | "friend" | "random";

export type GameStatus = "waiting" | "playing" | "finished" | "cancelled";

export type BoardSize = 3 | 4 | 5 | 6;

export type WinLength = 3 | 4 | 5 | 6;

export type PlayerSymbol = "X" | "O";

export type Cell = "" | "X" | "O";

export type Winner = "X" | "O" | "draw" | null;

export type Game = {
  id: string;
  mode: GameMode;
  status: GameStatus;
  board_size: BoardSize;
  win_length: WinLength;
  invite_code: string | null;
  player_x_token: string;
  player_o_token: string | null;
  player_x_name: string | null;
  player_x_age: number | null;
  player_o_name: string | null;
  player_o_age: number | null;
  current_turn: PlayerSymbol;
  board: Cell[];
  winner: Winner;
  created_at: string;
  updated_at: string;
};

export type AdPlacement =
  | "home_top"
  | "home_bottom"
  | "game_top"
  | "game_bottom"
  | "waiting_top"
  | "waiting_bottom"
  | "result_top"
  | "result_bottom";

export type LocalGameState = {
  mode: "computer";
  boardSize: BoardSize;
  winLength: WinLength;
  difficulty: ComputerDifficulty;
  board: Cell[];
  currentTurn: PlayerSymbol;
  status: GameStatus;
  winner: Winner;
};
