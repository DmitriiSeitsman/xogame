type ClassicOIconProps = {
  isWinning?: boolean;
  className?: string;
};

export function ClassicOIcon({
  isWinning = false,
  className = "",
}: ClassicOIconProps) {
  return (
    <svg
      className={[
        "symbol-svg",
        "classic-o-icon",
        isWinning ? "symbol-svg--winning" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Нолик"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="classicOGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="var(--color-o-start, #38bdf8)" />
          <stop offset="100%" stopColor="var(--color-o-end, #14b8a6)" />
        </linearGradient>
      </defs>

      <circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke="url(#classicOGrad)"
        strokeWidth="16"
      />
    </svg>
  );
}
