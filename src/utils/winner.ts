import type { PlayerSymbol, Winner } from "../types/game";

export function getWinnerMessage(
  winner: Winner,
  playerSymbol: PlayerSymbol | null,
): string {
  if (winner === "draw") {
    return "Ничья!";
  }

  if (winner === null) {
    return "";
  }

  if (playerSymbol === winner) {
    return "Вы победили!";
  }

  return "Вы проиграли";
}

export function getTurnMessage(
  currentTurn: PlayerSymbol,
  playerSymbol: PlayerSymbol | null,
  isFinished: boolean,
): string {
  if (isFinished) {
    return "";
  }

  if (playerSymbol === null) {
    return `Ход: ${currentTurn}`;
  }

  if (currentTurn === playerSymbol) {
    return "Ваш ход";
  }

  return "Ход соперника";
}
