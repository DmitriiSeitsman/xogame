import type { Cell } from "../../types/game";
import type { SymbolTheme } from "../../types/gameTheme";
import { GameSymbol } from "../GameSymbol/GameSymbol";
import "./GameCell.css";

type GameCellProps = {
  index: number;
  value: Cell;
  disabled?: boolean;
  isWinning?: boolean;
  symbolTheme?: SymbolTheme;
  onClick: () => void;
};

function getAriaLabel(index: number, value: Cell): string {
  const cellNumber = index + 1;
  if (value === "") {
    return `Пустая клетка ${cellNumber}`;
  }
  return `Клетка ${cellNumber} занята ${value}`;
}

export function GameCell({
  index,
  value,
  disabled = false,
  isWinning = false,
  symbolTheme = "classic",
  onClick,
}: GameCellProps) {
  const isOccupied = value !== "";
  const isInteractive = !disabled && !isOccupied;

  return (
    <button
      type="button"
      className={[
        "game-cell",
        value ? `game-cell--${value.toLowerCase()}` : "",
        isWinning ? "game-cell--winning" : "",
        isOccupied ? "game-cell--filled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || isOccupied}
      onClick={onClick}
      aria-label={getAriaLabel(index, value)}
      aria-disabled={!isInteractive}
    >
      {value !== "" && (
        <GameSymbol
          symbol={value}
          theme={symbolTheme}
          isWinning={isWinning}
        />
      )}
    </button>
  );
}
