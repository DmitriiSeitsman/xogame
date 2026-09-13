import type { Dictionary } from "../../i18n/dictionaries/ru";
import { useI18n } from "../../i18n/useI18n";
import type { BoardSize, GameMode } from "../../types/game";
import "./ModeSelector.css";

type ModeSelectorProps = {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  disabled?: boolean;
  queueCounts?: Record<BoardSize, number>;
};

const BOARD_SIZES: BoardSize[] = [3, 4, 5, 6];

function getModes(t: Dictionary): {
  value: GameMode;
  label: string;
  description: string;
  iconSrc: string;
}[] {
  return [
    {
      value: "computer",
      label: t.modeSelector.computer,
      description: t.modeSelector.computerDescription,
      iconSrc: "/computer.png",
    },
    {
      value: "friend",
      label: t.modeSelector.friend,
      description: t.modeSelector.friendDescription,
      iconSrc: "/friend.png",
    },
    {
      value: "random",
      label: t.modeSelector.random,
      description: t.modeSelector.randomDescription,
      iconSrc: "/random.png",
    },
  ];
}

export function ModeSelector({
  value,
  onChange,
  disabled = false,
  queueCounts,
}: ModeSelectorProps) {
  const { t } = useI18n();
  const modes = getModes(t);

  return (
    <div className="mode-selector">
      <h2 className="mode-selector__label" id="mode-selector-label">
        {t.modeSelector.label}
      </h2>
      <div
        className="mode-selector__options"
        role="group"
        aria-labelledby="mode-selector-label"
      >
        {modes.map((mode) => (
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
                  aria-label={t.modeSelector.queueLabel}
                >
                  {BOARD_SIZES.map((size) => (
                    <span key={size} className="mode-selector__queue-item">
                      <span className="mode-selector__queue-size">
                        {size}×{size}
                      </span>
                      <span className="mode-selector__queue-count">
                        {t.modeSelector.queueCount(queueCounts[size])}
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
