import type { BoardSize, Cell, WinLength } from "../types/game";
import { getCenterIndices } from "../utils/board";
import {
  calculateWinner,
  getAvailableMoves,
  makeLocalMove,
} from "../utils/gameEngine";

function findWinningMove(
  board: Cell[],
  boardSize: BoardSize,
  winLength: WinLength,
  symbol: "X" | "O",
): number | null {
  const moves = getAvailableMoves(board);

  for (const index of moves) {
    const nextBoard = makeLocalMove(board, index, symbol);
    if (calculateWinner(nextBoard, boardSize, winLength) === symbol) {
      return index;
    }
  }

  return null;
}

function pickRandomMove(moves: number[]): number | null {
  if (moves.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * moves.length);
  return moves[randomIndex] ?? null;
}

export function getComputerMove(params: {
  board: Cell[];
  boardSize: BoardSize;
  winLength: WinLength;
  computerSymbol: "O";
  playerSymbol: "X";
}): number | null {
  const { board, boardSize, winLength, computerSymbol, playerSymbol } = params;

  const winningMove = findWinningMove(
    board,
    boardSize,
    winLength,
    computerSymbol,
  );
  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = findWinningMove(
    board,
    boardSize,
    winLength,
    playerSymbol,
  );
  if (blockingMove !== null) {
    return blockingMove;
  }

  const centerIndices = getCenterIndices(boardSize);
  const freeCenter = centerIndices.find((index) => board[index] === "");
  if (freeCenter !== undefined) {
    return freeCenter;
  }

  return pickRandomMove(getAvailableMoves(board));
}
