import type { GameMode } from "../../types/game";
import "./ModeSelector.css";

type ModeSelectorProps = {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  disabled?: boolean;
};

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

export function ModeSelector({
  value,
  onChange,
  disabled = false,
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
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
