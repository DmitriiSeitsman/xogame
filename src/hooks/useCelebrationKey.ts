import { useEffect, useRef, useState } from "react";

/**
 * Returns a fresh, unique key each time `active` transitions from false to
 * true, and null while inactive. Meant to be passed as a React `key` to a
 * one-shot effect component (e.g. a confetti burst) so it remounts — and
 * therefore replays — exactly once per win, even if the underlying game
 * object keeps re-rendering while still finished (opponent leaving, polling,
 * etc.) or a rematch produces a brand new finish later.
 */
export function useCelebrationKey(active: boolean): number | null {
  const [key, setKey] = useState<number | null>(null);
  const wasActive = useRef(false);

  useEffect(() => {
    if (active && !wasActive.current) {
      setKey(Date.now());
    } else if (!active) {
      setKey(null);
    }
    wasActive.current = active;
  }, [active]);

  return key;
}
