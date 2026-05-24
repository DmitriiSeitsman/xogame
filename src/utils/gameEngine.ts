import type { BoardSize, Cell, PlayerSymbol, WinLength, Winner } from "../types/game";

export function createEmptyBoard(boardSize: BoardSize): Cell[] {
  return Array.from({ length: boardSize * boardSize }, () => "" as Cell);
}

export function getWinLength(boardSize: BoardSize): WinLength {
  return boardSize === 3 ? 3 : 4;
}

export function calculateWinner(
  board: Cell[],
  boardSize: BoardSize,
  winLength: WinLength,
): "X" | "O" | null {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const startIndex = row * boardSize + col;
      const symbol = board[startIndex];
      if (symbol === "") continue;

      for (const { dr, dc } of directions) {
        let count = 1;

        for (let step = 1; step < winLength; step++) {
          const nextRow = row + dr * step;
          const nextCol = col + dc * step;

          if (
            nextRow < 0 ||
            nextRow >= boardSize ||
            nextCol < 0 ||
            nextCol >= boardSize
          ) {
            break;
          }

          const nextIndex = nextRow * boardSize + nextCol;
          if (board[nextIndex] !== symbol) {
            break;
          }

          count++;
        }

        if (count >= winLength) {
          return symbol;
        }
      }
    }
  }

  return null;
}

export function getWinningCells(
  board: Cell[],
  boardSize: BoardSize,
  winLength: WinLength,
): number[] {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const startIndex = row * boardSize + col;
      const symbol = board[startIndex];
      if (symbol === "") continue;

      for (const { dr, dc } of directions) {
        const cells: number[] = [startIndex];
        let valid = true;

        for (let step = 1; step < winLength; step++) {
          const nextRow = row + dr * step;
          const nextCol = col + dc * step;

          if (
            nextRow < 0 ||
            nextRow >= boardSize ||
            nextCol < 0 ||
            nextCol >= boardSize
          ) {
            valid = false;
            break;
          }

          const nextIndex = nextRow * boardSize + nextCol;
          if (board[nextIndex] !== symbol) {
            valid = false;
            break;
          }

          cells.push(nextIndex);
        }

        if (valid && cells.length >= winLength) {
          return cells;
        }
      }
    }
  }

  return [];
}

export function isDraw(board: Cell[], winner: Winner): boolean {
  return winner === null && board.every((cell) => cell !== "");
}

export function getAvailableMoves(board: Cell[]): number[] {
  return board.reduce<number[]>((moves, cell, index) => {
    if (cell === "") {
      moves.push(index);
    }
    return moves;
  }, []);
}

export function makeLocalMove(
  board: Cell[],
  index: number,
  symbol: PlayerSymbol,
): Cell[] {
  if (board[index] !== "") {
    return board;
  }

  const nextBoard = [...board];
  nextBoard[index] = symbol;
  return nextBoard;
}
