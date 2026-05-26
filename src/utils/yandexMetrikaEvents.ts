import { YANDEX_METRIKA_ID } from "../constants/yandexMetrika";
import type { BoardSize, ComputerDifficulty } from "../types/game";
import type { SymbolTheme } from "../types/gameTheme";

type MetrikaParams = Record<string, string | number | boolean>;

function callYm(method: string, ...args: unknown[]): void {
  if (typeof window.ym !== "function") {
    return;
  }

  window.ym(YANDEX_METRIKA_ID, method, ...args);
}

function sendGoal(goal: string, params?: MetrikaParams): void {
  callYm("reachGoal", goal);

  if (!params || Object.keys(params).length === 0) {
    return;
  }

  callYm("params", params);
}

/** Локальная игра с ботом (кнопка «Начать игру»). */
export function trackGameStartComputer(options: {
  boardSize: BoardSize;
  difficulty: ComputerDifficulty;
  symbolTheme: SymbolTheme;
}): void {
  sendGoal("game_start_computer", {
    game_mode: "computer",
    board_size: options.boardSize,
    difficulty: options.difficulty,
    symbol_theme: options.symbolTheme,
  });
}

/** Создание игры с другом (хост). */
export function trackGameStartFriendHost(options: {
  boardSize: BoardSize;
  symbolTheme: SymbolTheme;
}): void {
  sendGoal("game_start_friend", {
    game_mode: "friend",
    board_size: options.boardSize,
    symbol_theme: options.symbolTheme,
    role: "host",
  });
}

/** Поиск случайного соперника. */
export function trackGameStartRandom(options: { boardSize: BoardSize }): void {
  sendGoal("game_start_random", {
    game_mode: "random",
    board_size: options.boardSize,
    role: "host",
  });
}

/** Подключение к игре друга по коду/ссылке (гость). */
export function trackGameJoinFriend(options: { boardSize: BoardSize }): void {
  sendGoal("game_join_friend", {
    game_mode: "friend",
    board_size: options.boardSize,
    role: "guest",
  });
}
