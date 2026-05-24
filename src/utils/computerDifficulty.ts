import type { ComputerDifficulty } from "../types/game";
import { COMPUTER_DIFFICULTIES } from "../types/game";

const STORAGE_KEY = "xogame_computer_difficulty";

export const COMPUTER_DIFFICULTY_LABELS: Record<ComputerDifficulty, string> = {
  easy: "Лёгкий",
  medium: "Средний",
  hard: "Сложный",
};

export function isComputerDifficulty(
  value: string,
): value is ComputerDifficulty {
  return COMPUTER_DIFFICULTIES.includes(value as ComputerDifficulty);
}

export function loadComputerDifficulty(): ComputerDifficulty {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && isComputerDifficulty(raw)) {
      return raw;
    }
  } catch {
    // Ignore storage errors.
  }

  return "medium";
}

export function saveComputerDifficulty(difficulty: ComputerDifficulty): void {
  try {
    localStorage.setItem(STORAGE_KEY, difficulty);
  } catch {
    // Ignore storage errors.
  }
}

export function parseComputerDifficultyParam(
  value: string | null,
): ComputerDifficulty | null {
  if (!value) {
    return null;
  }

  return isComputerDifficulty(value) ? value : null;
}
