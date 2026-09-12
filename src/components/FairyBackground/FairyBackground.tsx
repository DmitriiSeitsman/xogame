import "./FairyBackground.css";

type Sparkle = {
  top: string;
  left?: string;
  right?: string;
  size: number;
  color: string;
  delay: string;
  duration: string;
};

// Fixed, scattered sparkles/stars for a soft fairy-tale atmosphere. Kept near
// the edges so they never sit on top of the game board or main content, are
// pointer-events: none, and respect prefers-reduced-motion (see CSS).
const SPARKLES: Sparkle[] = [
  { top: "8%", left: "6%", size: 22, color: "#FDBA74", delay: "0s", duration: "5.5s" },
  { top: "18%", right: "8%", size: 16, color: "#F472B6", delay: "1.1s", duration: "4.5s" },
  { top: "38%", left: "3%", size: 14, color: "#38BDF8", delay: "2s", duration: "6s" },
  { top: "62%", right: "5%", size: 20, color: "#A855F7", delay: "0.6s", duration: "5s" },
  { top: "78%", left: "9%", size: 12, color: "#14B8A6", delay: "2.6s", duration: "4.8s" },
  { top: "88%", right: "12%", size: 16, color: "#FB7185", delay: "1.8s", duration: "5.8s" },
];

function SparkleIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 0C12.4 5.6 13.9 9 12 12C13.9 15 12.4 18.4 12 24C11.6 18.4 10.1 15 12 12C10.1 9 11.6 5.6 12 0Z"
        fill={color}
      />
      <path
        d="M0 12C5.6 11.6 9 10.1 12 12C15 10.1 18.4 11.6 24 12C18.4 12.4 15 13.9 12 12C9 13.9 5.6 12.4 0 12Z"
        fill={color}
      />
    </svg>
  );
}

export function FairyBackground() {
  return (
    <div className="fairy-background" aria-hidden="true">
      {SPARKLES.map((sparkle, index) => (
        <span
          key={index}
          className="fairy-background__sparkle"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            right: sparkle.right,
            animationDelay: sparkle.delay,
            animationDuration: sparkle.duration,
          }}
        >
          <SparkleIcon size={sparkle.size} color={sparkle.color} />
        </span>
      ))}
    </div>
  );
}
