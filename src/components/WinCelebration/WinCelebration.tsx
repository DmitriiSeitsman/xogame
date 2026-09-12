import { useMemo } from "react";
import "./WinCelebration.css";

const CONFETTI_COLORS = [
  "#FB7185",
  "#A855F7",
  "#38BDF8",
  "#14B8A6",
  "#F97316",
  "#FACC15",
];

const PIECE_COUNT = 26;

type Piece = {
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  shape: "circle" | "square";
};

function randomPieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, index) => ({
    left: Math.random() * 100,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    delay: Math.random() * 0.4,
    duration: 2.2 + Math.random() * 1.3,
    drift: (Math.random() - 0.5) * 140,
    rotate: Math.random() * 360,
    shape: Math.random() > 0.5 ? "circle" : "square",
  }));
}

/**
 * A one-shot confetti burst. Mount with a fresh `key` each time a win should
 * be celebrated (e.g. keyed off the game's updated_at) so React remounts a
 * new instance and replays the animation; the pieces fade out and the whole
 * overlay is pointer-events: none so it never blocks the board or buttons.
 */
export function WinCelebration() {
  const pieces = useMemo(randomPieces, []);

  return (
    <div className="win-celebration" aria-hidden="true">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className={`win-celebration__piece win-celebration__piece--${piece.shape}`}
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            // custom properties consumed by the keyframes below
            ["--drift" as string]: `${piece.drift}px`,
            ["--rotate" as string]: `${piece.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}
