import type { Dictionary } from "../../i18n/dictionaries/ru";
import { useI18n } from "../../i18n/useI18n";
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

function getAriaLabel(t: Dictionary, index: number, value: Cell): string {
  const cellNumber = index + 1;
  if (value === "") {
    return t.board.emptyCell(cellNumber);
  }
  return t.board.occupiedCell(cellNumber, value);
}

export function GameCell({
  index,
  value,
  disabled = false,
  isWinning = false,
  symbolTheme = "classic",
  onClick,
}: GameCellProps) {
  const { t } = useI18n();
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
      aria-label={getAriaLabel(t, index, value)}
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
