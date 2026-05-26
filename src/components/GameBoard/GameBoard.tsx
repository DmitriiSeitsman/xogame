import type { BoardSize, Cell } from "../../types/game";
import type { SymbolTheme } from "../../types/gameTheme";
import { GameCell } from "../GameCell/GameCell";
import "./GameBoard.css";

type GameBoardProps = {
  board: Cell[];
  boardSize: BoardSize;
  disabled?: boolean;
  winningCells?: number[];
  symbolTheme?: SymbolTheme;
  onCellClick: (index: number) => void;
};

export function GameBoard({
  board,
  boardSize,
  disabled = false,
  winningCells = [],
  symbolTheme = "classic",
  onCellClick,
}: GameBoardProps) {
  const winningSet = new Set(winningCells);

  return (
    <div
      className={`game-board board-size-${boardSize}`}
      style={{
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        gridTemplateRows: `repeat(${boardSize}, 1fr)`,
      }}
      role="grid"
      aria-label={`Игровое поле ${boardSize} на ${boardSize}`}
    >
      {board.map((cell, index) => (
        <GameCell
          key={index}
          index={index}
          value={cell}
          disabled={disabled || cell !== ""}
          isWinning={winningSet.has(index)}
          symbolTheme={symbolTheme}
          onClick={() => onCellClick(index)}
        />
      ))}
    </div>
  );
}
