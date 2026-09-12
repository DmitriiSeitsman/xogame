import { useEffect, useState } from "react";
import { onCelebration } from "../../utils/celebrationBus";
import "./FairyMascot.css";

const CELEBRATE_DURATION_MS = 2600;

/**
 * A small friendly star that lives in the corner of every page — mostly
 * decorative (gentle idle bob + blink), but perks up and celebrates for a
 * couple of seconds whenever any game on the site is won (see
 * utils/celebrationBus.ts).
 */
export function FairyMascot() {
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const unsubscribe = onCelebration(() => {
      setCelebrating(true);
      const timeoutId = window.setTimeout(() => {
        setCelebrating(false);
      }, CELEBRATE_DURATION_MS);
      return () => window.clearTimeout(timeoutId);
    });
    return unsubscribe;
  }, []);

  return (
    <div
      className={`fairy-mascot${celebrating ? " fairy-mascot--celebrating" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="fairy-mascot__svg">
        <defs>
          <linearGradient id="fairyMascotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
        </defs>
        <path
          className="fairy-mascot__body"
          d="M50 4C54 26 58 34 78 38C58 42 54 50 50 72C46 50 42 42 22 38C42 34 46 26 50 4Z
             M50 60C52.5 74 55 79 66 82C55 85 52.5 90 50 104C47.5 90 45 85 34 82C45 79 47.5 74 50 60Z"
          fill="url(#fairyMascotGrad)"
        />
        <circle className="fairy-mascot__eye" cx="42" cy="40" r="3.2" fill="#1E293B" />
        <circle className="fairy-mascot__eye" cx="58" cy="40" r="3.2" fill="#1E293B" />
        <path
          className="fairy-mascot__mouth"
          d="M43 48Q50 55 57 48"
          stroke="#1E293B"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <circle className="fairy-mascot__blush" cx="34" cy="46" r="3.4" fill="#FB7185" opacity="0.45" />
        <circle className="fairy-mascot__blush" cx="66" cy="46" r="3.4" fill="#FB7185" opacity="0.45" />
      </svg>
    </div>
  );
}
