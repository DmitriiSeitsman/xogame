import { useI18n } from "../../i18n/useI18n";
import type { BoardSize } from "../../types/game";
import "./BoardSizeSelector.css";

type BoardSizeSelectorProps = {
  value: BoardSize;
  onChange: (size: BoardSize) => void;
  disabled?: boolean;
  /** How many players are queued for each board size. Only passed in random
   * matchmaking mode — against the computer or a named friend there is no
   * queue to report, and showing "0 players" there would just be noise. */
  queueCounts?: Record<BoardSize, number>;
};

const SIZES: BoardSize[] = [3, 4, 5, 6];

export function BoardSizeSelector({
  value,
  onChange,
  disabled = false,
  queueCounts,
}: BoardSizeSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="board-size-selector">
      <h2 className="board-size-selector__label" id="board-size-label">
        {t.boardSize.label}
      </h2>
      <div
        className={`board-size-selector__options${
          queueCounts ? " board-size-selector__options--with-queue" : ""
        }`}
        role="group"
        aria-labelledby="board-size-label"
        aria-describedby={queueCounts ? "board-size-queue-hint" : undefined}
      >
        {SIZES.map((size) => (
          <button
            key={size}
            type="button"
            className={`board-size-selector__option${
              value === size ? " board-size-selector__option--active" : ""
            }`}
            onClick={() => onChange(size)}
            disabled={disabled}
            aria-pressed={value === size}
          >
            <span className="board-size-selector__size">
              {size}×{size}
            </span>
            {queueCounts && (
              <span className="board-size-selector__queue">
                {t.boardSize.playersWaiting(queueCounts[size])}
              </span>
            )}
          </button>
        ))}
      </div>
      {queueCounts && (
        <p id="board-size-queue-hint" className="board-size-selector__hint">
          {t.boardSize.queueLabel}
        </p>
      )}
    </div>
  );
}
