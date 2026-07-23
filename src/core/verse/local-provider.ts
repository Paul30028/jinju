import type { TranslationCode, Verse } from "../types";
import type { VerseProvider } from "./types";
import { getLocalCuvPool, seedToVerse, type SeedVerseRow } from "./seed";
import seed from "../../data/verses-cuv-seed.json";

/**
 * 本地和合本金句池 — 离线可用、零依赖，MVP 默认提供方
 */
export class LocalCuvProvider implements VerseProvider {
  readonly id = "local-cuv";
  readonly translation: TranslationCode = "cuv";

  private readonly pool: Verse[];

  constructor() {
    this.pool = getLocalCuvPool();
  }

  getPool(): readonly Verse[] {
    return this.pool;
  }

  async fetchByReference(reference: string): Promise<Verse> {
    const normalized = reference.replace(/\s+/g, "").toLowerCase();
    const rows = seed as SeedVerseRow[];
    const found = rows.find((row) => {
      const zh = row.reference.replace(/\s+/g, "").toLowerCase();
      const en =
        `${row.bookEn}${row.chapter}:${row.verseStart}`.toLowerCase();
      return (
        zh.includes(normalized) ||
        normalized.includes(zh) ||
        en.includes(normalized) ||
        normalized.includes(en)
      );
    });

    if (!found) {
      throw new Error(`LocalCuvProvider: verse not found for "${reference}"`);
    }
    return seedToVerse(found, this.translation);
  }

  async fetchDailyCandidate(_date: string): Promise<Verse | null> {
    return null;
  }
}
