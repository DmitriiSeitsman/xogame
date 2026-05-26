import type { Cell } from "../../types/game";
import type { SymbolTheme } from "../../types/gameTheme";
import { ClassicOIcon } from "./icons/ClassicOIcon";
import { ClassicXIcon } from "./icons/ClassicXIcon";
import { HeartIcon } from "./icons/HeartIcon";
import { UnicornIcon } from "./icons/UnicornIcon";
import "./GameSymbol.css";

type GameSymbolProps = {
  symbol: Exclude<Cell, "">;
  theme?: SymbolTheme;
  isWinning?: boolean;
};

export function GameSymbol({
  symbol,
  theme = "classic",
  isWinning = false,
}: GameSymbolProps) {
  if (theme === "magic") {
    return (
      <span
        className={[
          "game-symbol",
          "game-symbol--magic",
          isWinning ? "game-symbol--winning" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {symbol === "X" ? (
          <UnicornIcon isWinning={isWinning} />
        ) : (
          <HeartIcon isWinning={isWinning} />
        )}
      </span>
    );
  }

  return (
    <span
      className={[
        "game-symbol",
        "game-symbol--classic",
        isWinning ? "game-symbol--winning" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {symbol === "X" ? (
        <ClassicXIcon isWinning={isWinning} />
      ) : (
        <ClassicOIcon isWinning={isWinning} />
      )}
    </span>
  );
}
