import type { BilingualMode, TranslationCode, Verse } from "../types";

export function translationDisplayName(code?: TranslationCode): string {
  const normalized = String(code || "").trim().toLowerCase();
  switch (normalized) {
    case "cuv":
      return "CUV";
    case "esv":
      return "ESV";
    case "web":
      return "WEB";
    case "niv":
      return "NIV";
    default:
      return normalized ? normalized.toUpperCase() : "";
  }
}

export function getVerseTranslationLabel(
  verse: Verse,
  mode: BilingualMode,
): string {
  const zh = translationDisplayName(verse.translation || "cuv");
  const en = translationDisplayName(verse.en?.translation);

  if (mode === "en") return en || "EN";
  if (mode === "zh") return zh || "CUV";
  return [zh || "CUV", en].filter(Boolean).join(" · ");
}
