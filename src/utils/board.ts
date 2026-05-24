import type { BoardSize } from "../types/game";

export function indexToCoords(
  index: number,
  boardSize: BoardSize,
): { row: number; col: number } {
  return {
    row: Math.floor(index / boardSize),
    col: index % boardSize,
  };
}

export function coordsToIndex(
  row: number,
  col: number,
  boardSize: BoardSize,
): number {
  return row * boardSize + col;
}

export function getCenterIndices(boardSize: BoardSize): number[] {
  const mid = Math.floor(boardSize / 2);
  const indices: number[] = [];

  if (boardSize % 2 === 1) {
    indices.push(coordsToIndex(mid, mid, boardSize));
    return indices;
  }

  const pairs = [
    [mid - 1, mid - 1],
    [mid - 1, mid],
    [mid, mid - 1],
    [mid, mid],
  ];

  for (const [row, col] of pairs) {
    indices.push(coordsToIndex(row, col, boardSize));
  }

  return indices;
}
