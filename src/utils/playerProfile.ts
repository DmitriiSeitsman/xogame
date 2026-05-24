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

export function formatAge(age: number): string {
  const mod10 = age % 10;
  const mod100 = age % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return `${age} лет`;
  }

  if (mod10 === 1) {
    return `${age} год`;
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return `${age} года`;
  }

  return `${age} лет`;
}

export function formatPlayerProfile(name: string, age: number | null): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "";
  }

  if (age != null) {
    return `${trimmed}, ${formatAge(age)}`;
  }

  return trimmed;
}
