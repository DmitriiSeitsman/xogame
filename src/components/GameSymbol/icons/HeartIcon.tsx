type HeartIconProps = {
  isWinning?: boolean;
  className?: string;
};

export function HeartIcon({
  isWinning = false,
  className = "",
}: HeartIconProps) {
  return (
    <svg
      className={[
        "symbol-svg",
        "heart-icon",
        isWinning ? "symbol-svg--winning" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Сердечко"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="heartGrad"
          x1="20"
          y1="18"
          x2="80"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF8FB7" />
          <stop offset="0.52" stopColor="#FF5FA2" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>

        <radialGradient
          id="heartGlow"
          cx="50"
          cy="48"
          r="45"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        <filter
          id="heartShadow"
          x="-20"
          y="-16"
          width="140"
          height="140"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="5"
            floodColor="#EC4899"
            floodOpacity="0.28"
          />
        </filter>
      </defs>

      <g filter="url(#heartShadow)">
        <path
          d="M50 82C48.1 82 46.3 81.3 44.8 80C33.9 70.5 18 56.9 18 39.6C18 28.8 26 21 36.1 21C42.3 21 47.4 24.1 50 28.2C52.6 24.1 57.7 21 63.9 21C74 21 82 28.8 82 39.6C82 56.9 66.1 70.5 55.2 80C53.7 81.3 51.9 82 50 82Z"
          fill="url(#heartGrad)"
        />

        <path
          d="M50 82C48.1 82 46.3 81.3 44.8 80C33.9 70.5 18 56.9 18 39.6C18 28.8 26 21 36.1 21C42.3 21 47.4 24.1 50 28.2C52.6 24.1 57.7 21 63.9 21C74 21 82 28.8 82 39.6C82 56.9 66.1 70.5 55.2 80C53.7 81.3 51.9 82 50 82Z"
          fill="url(#heartGlow)"
          opacity="0.42"
        />

        <path
          d="M34.5 30.5C38.3 26.6 43.4 26.4 47.1 29.6"
          stroke="white"
          strokeOpacity="0.75"
          strokeWidth="4.8"
          strokeLinecap="round"
        />

        <circle cx="38" cy="35" r="2.2" fill="white" fillOpacity="0.45" />
      </g>
    </svg>
  );
}
