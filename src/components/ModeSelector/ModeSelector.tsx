import type { BoardSize, GameMode } from "../../types/game";
import "./ModeSelector.css";

type ModeSelectorProps = {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  disabled?: boolean;
  queueCounts?: Record<BoardSize, number>;
};

const BOARD_SIZES: BoardSize[] = [3, 4, 5, 6];

const MODES: {
  value: GameMode;
  label: string;
  description: string;
  iconSrc: string;
}[] = [
  {
    value: "computer",
    label: "С компьютером",
    description: "Тренируйся против бота",
    iconSrc: "/computer.png",
  },
  {
    value: "friend",
    label: "С другом",
    description: "Создай ссылку и отправь приглашение",
    iconSrc: "/friend.png",
  },
  {
    value: "random",
    label: "Случайный игрок",
    description: "Найди соперника онлайн",
    iconSrc: "/random.png",
  },
];

function formatQueueCount(count: number): string {
  if (count === 0) {
    return "0";
  }

  if (count === 1) {
    return "1 ищет";
  }

  return `${count} ищут`;
}

export function ModeSelector({
  value,
  onChange,
  disabled = false,
  queueCounts,
}: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <h2 className="mode-selector__label" id="mode-selector-label">
        Выберите режим игры
      </h2>
      <div
        className="mode-selector__options"
        role="group"
        aria-labelledby="mode-selector-label"
      >
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={`mode-selector__option${
              value === mode.value ? " mode-selector__option--active" : ""
            }`}
            onClick={() => onChange(mode.value)}
            disabled={disabled}
            aria-pressed={value === mode.value}
          >
            <span className="mode-selector__icon" aria-hidden="true">
              <img
                className="mode-selector__icon-img"
                src={mode.iconSrc}
                alt=""
                width={48}
                height={48}
                draggable={false}
              />
            </span>
            <span className="mode-selector__text">
              <span className="mode-selector__name">{mode.label}</span>
              <span className="mode-selector__desc">{mode.description}</span>
              {mode.value === "random" && queueCounts && (
                <span
                  className="mode-selector__queue"
                  aria-label="Игроки в поиске соперника по размеру поля"
                >
                  {BOARD_SIZES.map((size) => (
                    <span key={size} className="mode-selector__queue-item">
                      <span className="mode-selector__queue-size">
                        {size}×{size}
                      </span>
                      <span className="mode-selector__queue-count">
                        {formatQueueCount(queueCounts[size])}
                      </span>
                    </span>
                  ))}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
