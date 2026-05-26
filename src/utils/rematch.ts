import type { Game } from "../types/game";
import { formatPlayerProfile } from "./playerProfile";

export type RematchStatus = "offered" | "declined";

export function isFriendGameHost(game: Game, playerToken: string): boolean {
  return game.player_x_token === playerToken;
}

export function isFriendGameGuest(game: Game, playerToken: string): boolean {
  return game.player_o_token === playerToken;
}

export function getHostProfileLabel(game: Game): string {
  if (!game.player_x_name) {
    return "Игрок";
  }

  return formatPlayerProfile(game.player_x_name, game.player_x_age);
}
