import type { PlayerSymbol } from "../../types/game";
import type { SymbolTheme } from "../../types/gameTheme";
import { GameSymbol } from "../GameSymbol/GameSymbol";
import "./GameStatus.css";

type GameStatusProps = {
  title: string;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "muted";
  symbol?: PlayerSymbol | null;
  symbolTheme?: SymbolTheme;
  showLoader?: boolean;
};

export function GameStatus({
  title,
  subtitle,
  variant = "default",
  symbol = null,
  symbolTheme = "classic",
  showLoader = false,
}: GameStatusProps) {
  return (
    <div
      className={`game-status game-status--${variant} page-enter`}
      role="status"
      aria-live="polite"
    >
      <div className="game-status__row">
        {showLoader && <span className="game-status__loader" aria-hidden="true" />}
        {symbol && (
          <span className="game-status__symbol-wrap" aria-hidden="true">
            <GameSymbol symbol={symbol} theme={symbolTheme} />
          </span>
        )}
        <p className="game-status__title">{title}</p>
      </div>
      {subtitle && <p className="game-status__subtitle">{subtitle}</p>}
    </div>
  );
}
