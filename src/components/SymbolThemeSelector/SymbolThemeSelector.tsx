import type { SymbolTheme } from "../../types/gameTheme";
import { ClassicOIcon } from "../GameSymbol/icons/ClassicOIcon";
import { ClassicXIcon } from "../GameSymbol/icons/ClassicXIcon";
import { HeartIcon } from "../GameSymbol/icons/HeartIcon";
import { UnicornIcon } from "../GameSymbol/icons/UnicornIcon";
import "./SymbolThemeSelector.css";

type SymbolThemeSelectorProps = {
  value: SymbolTheme;
  onChange: (theme: SymbolTheme) => void;
  disabled?: boolean;
};

export function SymbolThemeSelector({
  value,
  onChange,
  disabled = false,
}: SymbolThemeSelectorProps) {
  return (
    <section className="symbol-theme-selector" aria-label="Выбор темы символов">
      <div className="symbol-theme-selector__header">
        <h2>Тема символов</h2>
        <p>Выберите классические значки или волшебную тему</p>
      </div>

      <div className="symbol-theme-selector__options">
        <button
          type="button"
          className={[
            "symbol-theme-option",
            value === "classic" ? "symbol-theme-option--selected" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange("classic")}
          disabled={disabled}
        >
          <span
            className="symbol-theme-option__preview symbol-theme-option__preview--icons"
            aria-hidden="true"
          >
            <ClassicXIcon className="symbol-theme-option__icon" />
            <ClassicOIcon className="symbol-theme-option__icon" />
          </span>
          <span className="symbol-theme-option__title">Классика</span>
        </button>

        <button
          type="button"
          className={[
            "symbol-theme-option",
            value === "magic" ? "symbol-theme-option--selected" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange("magic")}
          disabled={disabled}
        >
          <span
            className="symbol-theme-option__preview symbol-theme-option__preview--icons"
            aria-hidden="true"
          >
            <UnicornIcon className="symbol-theme-option__icon symbol-theme-option__icon--unicorn" />
            <HeartIcon className="symbol-theme-option__icon" />
          </span>
          <span className="symbol-theme-option__title">Волшебная</span>
        </button>
      </div>
    </section>
  );
}
