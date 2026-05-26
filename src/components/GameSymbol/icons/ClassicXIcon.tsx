type ClassicXIconProps = {
  isWinning?: boolean;
  className?: string;
};

export function ClassicXIcon({
  isWinning = false,
  className = "",
}: ClassicXIconProps) {
  return (
    <svg
      className={[
        "symbol-svg",
        "classic-x-icon",
        isWinning ? "symbol-svg--winning" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Крестик"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="classicXGrad"
          x1="20"
          y1="18"
          x2="82"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FB7185" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>

        <filter
          id="classicXShadow"
          x="-20"
          y="-20"
          width="140"
          height="140"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="4"
            floodColor="#A855F7"
            floodOpacity="0.24"
          />
        </filter>
      </defs>

      <g filter="url(#classicXShadow)">
        <path
          d="M28 28L72 72"
          stroke="url(#classicXGrad)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M72 28L28 72"
          stroke="url(#classicXGrad)"
          strokeWidth="15"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
