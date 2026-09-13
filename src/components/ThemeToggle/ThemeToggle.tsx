import { useI18n } from "../../i18n/useI18n";
import { useTheme } from "../../hooks/useTheme";
import { setTheme, type Theme } from "../../utils/theme";
import "./ThemeToggle.css";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.4" fill="currentColor" />
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2" />
        <path d="M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M20.2 14.4A8.6 8.6 0 0 1 9.6 3.8a8.6 8.6 0 1 0 10.6 10.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

const OPTIONS: { value: Theme; Icon: () => React.ReactElement }[] = [
  { value: "light", Icon: SunIcon },
  { value: "dark", Icon: MoonIcon },
];

type ThemeToggleProps = {
  className?: string;
};

/**
 * Light/dark switch. Before it's ever used the site follows the OS setting;
 * the first press stores an explicit choice, which then wins over the OS
 * from that point on (see src/utils/theme.ts).
 */
export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { t } = useI18n();
  const theme = useTheme();

  const labels: Record<Theme, string> = {
    light: t.theme.light,
    dark: t.theme.dark,
  };

  return (
    <div
      className={`theme-toggle${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={t.theme.label}
    >
      {OPTIONS.map(({ value, Icon }) => (
        <button
          key={value}
          type="button"
          className={`theme-toggle__option${
            value === theme ? " theme-toggle__option--active" : ""
          }`}
          onClick={() => setTheme(value)}
          aria-pressed={value === theme}
          title={labels[value]}
        >
          <Icon />
          <span className="theme-toggle__label">{labels[value]}</span>
        </button>
      ))}
    </div>
  );
}
