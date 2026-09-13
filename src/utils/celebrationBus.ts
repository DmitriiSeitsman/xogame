export type GameOutcome = "win" | "loss";

type Listener = (outcome: GameOutcome) => void;

const listeners = new Set<Listener>();

/**
 * Tiny global pub-sub so the end-of-game effects (mounted per-game, inside
 * GamePage) can nudge the fairy mascot (mounted once, at the app-layout
 * level) to react too, without wiring game state through React context just
 * for this one cosmetic touch.
 *
 * The outcome travels with the event because the mascot answers a win and a
 * loss differently — bouncing at someone who just lost would be unkind.
 */
export function emitCelebration(outcome: GameOutcome): void {
  listeners.forEach((listener) => listener(outcome));
}

export function onCelebration(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
