import { useEffect, useRef, useState } from "react";
import { onCelebration, type GameOutcome } from "../../utils/celebrationBus";
import "./FairyMascot.css";

const REACTION_DURATION_MS = 2600;

/**
 * A small friendly star that lives in the corner of every page — mostly
 * decorative (gentle idle bob + blink), but reacts for a couple of seconds
 * whenever a game on the site ends (see utils/celebrationBus.ts): it bounces
 * for a win and gives a sympathetic droop for a loss. Bouncing at a player
 * who just lost would read as gloating.
 */
export function FairyMascot() {
  const [reaction, setReaction] = useState<GameOutcome | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId = 0;

    const unsubscribe = onCelebration((outcome) => {
      window.clearTimeout(timeoutId);
      setReaction(outcome);
      timeoutId = window.setTimeout(() => {
        setReaction(null);
      }, REACTION_DURATION_MS);
    });

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  /**
   * The mascot is fixed to the bottom-right corner, so on a scrolled-to-the-
   * end page it used to sit on top of the footer text. Instead of parking it
   * permanently higher — which would leave it floating oddly the rest of the
   * time — it rides up by exactly however much of the footer is on screen.
   *
   * Written straight to a custom property through a ref rather than through
   * state: this runs on every scroll frame, and re-rendering for it would be
   * wasteful. The footer is display:none on mobile game screens, which
   * reports a zero-height rect — treated as "no footer", or the mascot would
   * shoot to the top of the screen.
   */
  useEffect(() => {
    const element = ref.current;
    const footer = document.querySelector(".site-footer");
    if (!element || !footer) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = footer.getBoundingClientRect();
      const lift =
        rect.height === 0 ? 0 : Math.max(0, window.innerHeight - rect.top);
      element.style.setProperty("--fairy-mascot-lift", `${Math.round(lift)}px`);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`fairy-mascot${reaction ? ` fairy-mascot--${reaction}` : ""}`}
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
