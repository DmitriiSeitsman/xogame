import type { ComputerDifficulty } from "../../types/game";
import { COMPUTER_DIFFICULTIES } from "../../types/game";
import { useI18n } from "../../i18n/useI18n";
import { getComputerDifficultyLabel } from "../../utils/computerDifficulty";
import "./DifficultySelector.css";

type DifficultySelectorProps = {
  value: ComputerDifficulty;
  onChange: (difficulty: ComputerDifficulty) => void;
  disabled?: boolean;
};

export function DifficultySelector({
  value,
  onChange,
  disabled = false,
}: DifficultySelectorProps) {
  const { t } = useI18n();

  return (
    <div className="difficulty-selector">
      <h2 className="difficulty-selector__label" id="difficulty-label">
        {t.difficulty.label}
      </h2>
      <div
        className="difficulty-selector__options"
        role="group"
        aria-labelledby="difficulty-label"
      >
        {COMPUTER_DIFFICULTIES.map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            className={`difficulty-selector__option${
              value === difficulty ? " difficulty-selector__option--active" : ""
            }`}
            onClick={() => onChange(difficulty)}
            disabled={disabled}
            aria-pressed={value === difficulty}
          >
            {getComputerDifficultyLabel(t, difficulty)}
          </button>
        ))}
      </div>
    </div>
  );
}
