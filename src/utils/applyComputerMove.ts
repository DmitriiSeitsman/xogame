import type { Cell, LocalGameState } from "../types/game";
import {
  normalizeComputerMoveIndex,
  type ComputerMoveRequest,
} from "../services/computerPlayerService";
import {
  calculateWinner,
  getAvailableMoves,
  isDraw,
  makeLocalMove,
} from "./gameEngine";

function buildMoveRequest(game: LocalGameState, board: Cell[]): ComputerMoveRequest {
  return {
    board,
    boardSize: game.boardSize,
    winLength: game.winLength,
    computerSymbol: "O",
    playerSymbol: "X",
    difficulty: game.difficulty,
  };
}

export function applyComputerMove(
  game: LocalGameState,
  boardAfterPlayer: Cell[],
  computerIndex: number | null,
): LocalGameState {
  const availableMoves = getAvailableMoves(boardAfterPlayer);

  if (availableMoves.length === 0) {
    const winner = calculateWinner(
      boardAfterPlayer,
      game.boardSize,
      game.winLength,
    );

    return {
      ...game,
      board: boardAfterPlayer,
      winner: winner ?? "draw",
      status: "finished",
    };
  }

  const moveIndex = normalizeComputerMoveIndex(
    boardAfterPlayer,
    computerIndex,
    buildMoveRequest(game, boardAfterPlayer),
  );

  const resolvedIndex = moveIndex ?? availableMoves[0];

  const boardAfterComputer = makeLocalMove(
    boardAfterPlayer,
    resolvedIndex,
    "O",
  );

  if (boardAfterComputer[resolvedIndex] !== "O") {
    const emergencyIndex = availableMoves[0];
    const boardAfterEmergency = makeLocalMove(
      boardAfterPlayer,
      emergencyIndex,
      "O",
    );

    return finalizeAfterBotMove(game, boardAfterEmergency);
  }

  return finalizeAfterBotMove(game, boardAfterComputer);
}

function finalizeAfterBotMove(
  game: LocalGameState,
  boardAfterComputer: Cell[],
): LocalGameState {
  const winnerAfterComputer = calculateWinner(
    boardAfterComputer,
    game.boardSize,
    game.winLength,
  );

  if (winnerAfterComputer) {
    return {
      ...game,
      board: boardAfterComputer,
      winner: winnerAfterComputer,
      status: "finished",
    };
  }

  if (isDraw(boardAfterComputer, null)) {
    return {
      ...game,
      board: boardAfterComputer,
      winner: "draw",
      status: "finished",
    };
  }

  return {
    ...game,
    board: boardAfterComputer,
    currentTurn: "X",
  };
}
