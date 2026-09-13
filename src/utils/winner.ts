import type { Dictionary } from "../i18n/dictionaries/ru";
import type { PlayerSymbol, Winner } from "../types/game";

export function getWinnerMessage(
  t: Dictionary,
  winner: Winner,
  playerSymbol: PlayerSymbol | null,
): string {
  if (winner === "draw") {
    return t.winner.draw;
  }

  if (winner === null) {
    return "";
  }

  if (playerSymbol === winner) {
    return t.winner.youWon;
  }

  return t.winner.youLost;
}

export function getTurnMessage(
  t: Dictionary,
  currentTurn: PlayerSymbol,
  playerSymbol: PlayerSymbol | null,
  isFinished: boolean,
): string {
  if (isFinished) {
    return "";
  }

  if (playerSymbol === null) {
    return t.winner.turnOf(currentTurn);
  }

  if (currentTurn === playerSymbol) {
    return t.winner.yourTurn;
  }

  return t.winner.opponentTurn;
}
