import type { BoardSize } from "../../types/game";
import "./BoardSizeSelector.css";

type BoardSizeSelectorProps = {
  value: BoardSize;
  onChange: (size: BoardSize) => void;
  disabled?: boolean;
};

const SIZES: BoardSize[] = [3, 4, 5, 6];

export function BoardSizeSelector({
  value,
  onChange,
  disabled = false,
}: BoardSizeSelectorProps) {
  return (
    <div className="board-size-selector">
      <h2 className="board-size-selector__label" id="board-size-label">
        Выберите размер поля
      </h2>
      <div
        className="board-size-selector__options"
        role="group"
        aria-labelledby="board-size-label"
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
            {size}×{size}
          </button>
        ))}
      </div>
    </div>
  );
}
