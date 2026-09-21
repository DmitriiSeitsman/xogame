import type { Dictionary } from "../i18n/dictionaries/ru";
import type { Game } from "../types/game";
import { playerLabel } from "./playerProfile";

/** The opponent's name, or "Игрок 1/2" if they didn't give one. `null`
 * when the viewer isn't one of the two players. */
export function getOpponentProfileLabel(
  t: Dictionary,
  game: Game,
  playerToken: string,
): string | null {
  if (game.player_x_token === playerToken) {
    return playerLabel(t, game.player_o_name, "O");
  }
  if (game.player_o_token === playerToken) {
    return playerLabel(t, game.player_x_name, "X");
  }
  return null;
}
