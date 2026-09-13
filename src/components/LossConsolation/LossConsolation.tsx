import { useMemo } from "react";
import "./LossConsolation.css";

/** Cool, desaturated tones: visible on the lavender light theme and on the
 * plum dark one, without any of confetti's brightness. */
const DRIFT_COLORS = ["#A5B4FC", "#C4B5FD", "#93C5FD", "#CBD5E1"];

const PIECE_COUNT = 10;

type Piece = {
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  sway: number;
};

function randomPieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, index) => ({
    left: Math.random() * 100,
    size: 7 + Math.random() * 7,
    color: DRIFT_COLORS[index % DRIFT_COLORS.length],
    delay: Math.random() * 0.8,
    duration: 3.6 + Math.random() * 1.6,
    sway: (Math.random() - 0.5) * 60,
  }));
}

/**
 * The counterpart to WinCelebration, for a game the player lost. Confetti
 * reads as applause, which is the wrong note entirely when you've just been
 * beaten — so this is its opposite in every dimension: a third as many
 * pieces, drifting rather than bursting, roughly half the speed, muted
 * cool colours instead of party brights, and no rotation.
 *
 * It is deliberately gentle rather than gloomy: the site is built for a
 * child, and losing a round of noughts and crosses should feel like
 * "again?", not like a penalty.
 *
 * Mount with a fresh `key` per loss so React replays it; the overlay is
 * pointer-events: none and never blocks the board.
 */
export function LossConsolation() {
  const pieces = useMemo(() => randomPieces(), []);

  return (
    <div className="loss-consolation" aria-hidden="true">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="loss-consolation__piece"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ["--sway" as string]: `${piece.sway}px`,
          }}
        />
      ))}
    </div>
  );
}
