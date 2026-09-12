type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Tiny global pub-sub so the win-confetti (mounted per-game, inside
 * GamePage) can nudge the fairy mascot (mounted once, at the app-layout
 * level) to celebrate too, without wiring game state through React context
 * just for this one cosmetic reaction.
 */
export function emitCelebration(): void {
  listeners.forEach((listener) => listener());
}

export function onCelebration(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
