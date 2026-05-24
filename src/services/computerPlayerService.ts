import type {
  BoardSize,
  Cell,
  ComputerDifficulty,
  PlayerSymbol,
  WinLength,
} from "../types/game";
import { getCenterIndices } from "../utils/board";
import {
  calculateWinner,
  getAvailableMoves,
  isDraw,
  makeLocalMove,
} from "../utils/gameEngine";

type MoveParams = {
  board: Cell[];
  boardSize: BoardSize;
  winLength: WinLength;
  computerSymbol: PlayerSymbol;
  playerSymbol: PlayerSymbol;
};

function findWinningMove(
  board: Cell[],
  boardSize: BoardSize,
  winLength: WinLength,
  symbol: PlayerSymbol,
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

function getMediumMove(params: MoveParams): number | null {
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

function getEasyMove(params: MoveParams): number | null {
  const { board, boardSize, winLength, computerSymbol, playerSymbol } = params;
  const moves = getAvailableMoves(board);

  if (moves.length === 0) {
    return null;
  }

  const winningMove = findWinningMove(
    board,
    boardSize,
    winLength,
    computerSymbol,
  );
  const blockingMove = findWinningMove(
    board,
    boardSize,
    winLength,
    playerSymbol,
  );

  const roll = Math.random();

  if (roll < 0.18 && winningMove !== null) {
    return winningMove;
  }

  if (roll < 0.38 && blockingMove !== null) {
    return blockingMove;
  }

  return pickRandomMove(moves);
}

function scoreWindow(cells: Cell[], symbol: PlayerSymbol): number {
  let ours = 0;
  let theirs = 0;
  let empty = 0;

  for (const cell of cells) {
    if (cell === "") {
      empty += 1;
    } else if (cell === symbol) {
      ours += 1;
    } else {
      theirs += 1;
    }
  }

  if (theirs > 0 && ours > 0) {
    return 0;
  }

  if (ours > 0 && theirs === 0) {
    return 10 ** ours;
  }

  if (theirs > 0 && ours === 0) {
    return -(10 ** theirs);
  }

  return empty === cells.length ? 1 : 0;
}

function evaluateBoard(
  board: Cell[],
  boardSize: BoardSize,
  winLength: WinLength,
  computerSymbol: PlayerSymbol,
  playerSymbol: PlayerSymbol,
): number {
  const winner = calculateWinner(board, boardSize, winLength);

  if (winner === computerSymbol) {
    return 1_000_000;
  }

  if (winner === playerSymbol) {
    return -1_000_000;
  }

  if (isDraw(board, null)) {
    return 0;
  }

  let score = 0;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col <= boardSize - winLength; col++) {
      const cells: Cell[] = [];
      for (let step = 0; step < winLength; step++) {
        cells.push(board[row * boardSize + col + step]);
      }
      score += scoreWindow(cells, computerSymbol);
      score -= scoreWindow(cells, playerSymbol);
    }
  }

  for (let col = 0; col < boardSize; col++) {
    for (let row = 0; row <= boardSize - winLength; row++) {
      const cells: Cell[] = [];
      for (let step = 0; step < winLength; step++) {
        cells.push(board[(row + step) * boardSize + col]);
      }
      score += scoreWindow(cells, computerSymbol);
      score -= scoreWindow(cells, playerSymbol);
    }
  }

  for (let row = 0; row <= boardSize - winLength; row++) {
    for (let col = 0; col <= boardSize - winLength; col++) {
      const diag: Cell[] = [];
      const antiDiag: Cell[] = [];

      for (let step = 0; step < winLength; step++) {
        diag.push(board[(row + step) * boardSize + col + step]);
        antiDiag.push(board[(row + step) * boardSize + col + winLength - 1 - step]);
      }

      score += scoreWindow(diag, computerSymbol);
      score -= scoreWindow(diag, playerSymbol);
      score += scoreWindow(antiDiag, computerSymbol);
      score -= scoreWindow(antiDiag, playerSymbol);
    }
  }

  return score;
}

function orderMoves(
  board: Cell[],
  moves: number[],
  boardSize: BoardSize,
  winLength: WinLength,
  currentSymbol: PlayerSymbol,
  opponentSymbol: PlayerSymbol,
): number[] {
  const centerSet = new Set(getCenterIndices(boardSize));

  return [...moves].sort((left, right) => {
    const scoreMove = (index: number) => {
      let score = 0;
      const afterMove = makeLocalMove(board, index, currentSymbol);

      if (calculateWinner(afterMove, boardSize, winLength) === currentSymbol) {
        score += 1_000;
      }

      if (findWinningMove(board, boardSize, winLength, opponentSymbol) === index) {
        score += 500;
      }

      if (centerSet.has(index)) {
        score += 40;
      }

      return score;
    };

    return scoreMove(right) - scoreMove(left);
  });
}

function getSearchDepth(boardSize: BoardSize, emptyCells: number): number {
  if (boardSize === 3) {
    return emptyCells;
  }

  if (emptyCells <= 10) {
    return emptyCells;
  }

  if (emptyCells <= 16) {
    return 6;
  }

  return 4;
}

function minimax(
  board: Cell[],
  depth: number,
  maxDepth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  params: MoveParams,
): number {
  const { boardSize, winLength, computerSymbol, playerSymbol } = params;
  const winner = calculateWinner(board, boardSize, winLength);

  if (winner === computerSymbol) {
    return 1_000_000 - depth;
  }

  if (winner === playerSymbol) {
    return depth - 1_000_000;
  }

  if (isDraw(board, null) || depth >= maxDepth) {
    return evaluateBoard(
      board,
      boardSize,
      winLength,
      computerSymbol,
      playerSymbol,
    );
  }

  const currentSymbol = isMaximizing ? computerSymbol : playerSymbol;
  const opponentSymbol = isMaximizing ? playerSymbol : computerSymbol;
  const moves = orderMoves(
    board,
    getAvailableMoves(board),
    boardSize,
    winLength,
    currentSymbol,
    opponentSymbol,
  );

  if (moves.length === 0) {
    return 0;
  }

  if (isMaximizing) {
    let best = -Infinity;

    for (const move of moves) {
      const nextBoard = makeLocalMove(board, move, computerSymbol);
      const score = minimax(
        nextBoard,
        depth + 1,
        maxDepth,
        false,
        alpha,
        beta,
        params,
      );
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);

      if (beta <= alpha) {
        break;
      }
    }

    return best;
  }

  let best = Infinity;

  for (const move of moves) {
    const nextBoard = makeLocalMove(board, move, playerSymbol);
    const score = minimax(
      nextBoard,
      depth + 1,
      maxDepth,
      true,
      alpha,
      beta,
      params,
    );
    best = Math.min(best, score);
    beta = Math.min(beta, score);

    if (beta <= alpha) {
      break;
    }
  }

  return best;
}

function getHardMove(
  params: MoveParams,
  onProgress?: (percent: number) => void,
): number | null {
  const moves = getAvailableMoves(params.board);

  if (moves.length === 0) {
    return null;
  }

  const immediateWin = findWinningMove(
    params.board,
    params.boardSize,
    params.winLength,
    params.computerSymbol,
  );
  if (immediateWin !== null) {
    return immediateWin;
  }

  const immediateBlock = findWinningMove(
    params.board,
    params.boardSize,
    params.winLength,
    params.playerSymbol,
  );
  if (immediateBlock !== null) {
    return immediateBlock;
  }

  const maxDepth = getSearchDepth(params.boardSize, moves.length);
  let bestMove = moves[0];
  let bestScore = -Infinity;

  const orderedMoves = orderMoves(
    params.board,
    moves,
    params.boardSize,
    params.winLength,
    params.computerSymbol,
    params.playerSymbol,
  );

  for (let index = 0; index < orderedMoves.length; index++) {
    const move = orderedMoves[index];
    const nextBoard = makeLocalMove(params.board, move, params.computerSymbol);
    const score = minimax(
      nextBoard,
      1,
      maxDepth,
      false,
      -Infinity,
      Infinity,
      params,
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    onProgress?.(Math.round(((index + 1) / orderedMoves.length) * 100));
  }

  return bestMove;
}

export type ComputerMoveRequest = MoveParams & {
  difficulty: ComputerDifficulty;
};

function isValidEmptyCell(board: Cell[], index: number | null): index is number {
  return (
    index !== null &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < board.length &&
    board[index] === ""
  );
}

/** Ensures the bot always gets a legal empty cell when one exists. */
export function normalizeComputerMoveIndex(
  board: Cell[],
  index: number | null,
  params: ComputerMoveRequest,
): number | null {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) {
    return null;
  }

  if (isValidEmptyCell(board, index)) {
    return index;
  }

  const fallback = getMediumMove({
    board,
    boardSize: params.boardSize,
    winLength: params.winLength,
    computerSymbol: params.computerSymbol,
    playerSymbol: params.playerSymbol,
  });

  if (isValidEmptyCell(board, fallback)) {
    return fallback;
  }

  return moves[0] ?? null;
}

export function getComputerMove(
  params: ComputerMoveRequest & {
    onProgress?: (percent: number) => void;
  },
): number | null {
  const moveParams: MoveParams = {
    board: params.board,
    boardSize: params.boardSize,
    winLength: params.winLength,
    computerSymbol: params.computerSymbol,
    playerSymbol: params.playerSymbol,
  };

  switch (params.difficulty) {
    case "easy":
      return getEasyMove(moveParams);
    case "hard":
      return getHardMove(moveParams, params.onProgress);
    case "medium":
    default:
      return getMediumMove(moveParams);
  }
}
