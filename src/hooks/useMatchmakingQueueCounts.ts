import { useEffect, useState } from "react";
import type { BoardSize } from "../types/game";
import { getMatchmakingQueueCounts } from "../services/gameService";

const POLL_INTERVAL_MS = 12_000;

const EMPTY_COUNTS: Record<BoardSize, number> = {
  3: 0,
  4: 0,
  5: 0,
  6: 0,
};

export function useMatchmakingQueueCounts(enabled = true) {
  const [counts, setCounts] = useState<Record<BoardSize, number>>(EMPTY_COUNTS);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const loadCounts = async () => {
      try {
        const nextCounts = await getMatchmakingQueueCounts();
        if (!cancelled) {
          setCounts(nextCounts);
        }
      } catch {
        // Keep the last known counts if polling fails.
      }
    };

    void loadCounts();

    const intervalId = window.setInterval(() => {
      void loadCounts();
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadCounts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  return counts;
}
