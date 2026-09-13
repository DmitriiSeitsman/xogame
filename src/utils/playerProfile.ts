import type { Dictionary } from "../i18n/dictionaries/ru";

export type PlayerProfile = {
  name: string;
  age: number | null;
};

const STORAGE_KEY = "xogame_player_profile";

export function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { name: "", age: null };
    }

    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      age:
        typeof parsed.age === "number" && Number.isFinite(parsed.age)
          ? parsed.age
          : null,
    };
  } catch {
    return { name: "", age: null };
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      name: profile.name.trim(),
      age: profile.age,
    }),
  );
}

/** Locale-aware age phrasing ("40 лет" / "40 years old"). */
export function formatAge(t: Dictionary, age: number): string {
  return t.profile.formatAge(age);
}

export function formatPlayerProfile(
  t: Dictionary,
  name: string,
  age: number | null,
): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "";
  }

  if (age != null) {
    return `${trimmed}, ${formatAge(t, age)}`;
  }

  return trimmed;
}
