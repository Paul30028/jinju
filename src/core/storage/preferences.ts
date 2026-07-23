import { DEFAULT_PREFERENCES, type UserPreferences } from "../types";

const PREF_KEY = "jinju-ri:preferences:v1";

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

export function updatePreferences(
  patch: Partial<UserPreferences>,
): UserPreferences {
  const next = { ...loadPreferences(), ...patch };
  savePreferences(next);
  return next;
}
