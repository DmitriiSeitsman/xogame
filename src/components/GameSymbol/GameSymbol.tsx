import { useId } from "react";
import "./GameSymbol.css";

type GameSymbolProps = {
  symbol: "X" | "O";
  isWinning?: boolean;
};

export function GameSymbol({ symbol, isWinning = false }: GameSymbolProps) {
  const uid = useId().replace(/:/g, "");
  const className = `game-symbol game-symbol--${symbol.toLowerCase()}${
    isWinning ? " game-symbol--winning" : ""
  }`;

  if (symbol === "X") {
    return (
      <svg
        className={className}
        viewBox="0 0 100 100"
        aria-hidden="true"
        role="img"
      >
        <defs>
          <linearGradient id={`x-gradient-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-x-start)" />
            <stop offset="100%" stopColor="var(--color-x-end)" />
          </linearGradient>
        </defs>
        <line
          x1="22"
          y1="22"
          x2="78"
          y2="78"
          stroke={`url(#x-gradient-${uid})`}
          strokeWidth="16"
          strokeLinecap="round"
        />
        <line
          x1="78"
          y1="22"
          x2="22"
          y2="78"
          stroke={`url(#x-gradient-${uid})`}
          strokeWidth="16"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id={`o-gradient-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-o-start)" />
          <stop offset="100%" stopColor="var(--color-o-end)" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke={`url(#o-gradient-${uid})`}
        strokeWidth="16"
      />
    </svg>
  );
}
