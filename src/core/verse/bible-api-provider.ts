import type { TranslationCode, Verse } from "../types";
import type { VerseProvider } from "./types";

interface BibleApiResponse {
  reference?: string;
  text?: string;
  translation_id?: string;
  translation_name?: string;
  verses?: Array<{
    book_name?: string;
    chapter?: number;
    verse?: number;
    text?: string;
  }>;
}

/**
 * bible-api.com 适配器（可选网络增强）
 * 失败时应由上层回退到 LocalCuvProvider
 */
export class BibleApiCuvProvider implements VerseProvider {
  readonly id = "bible-api-cuv";
  readonly translation: TranslationCode = "cuv";

  constructor(
    private readonly baseUrl = import.meta.env.VITE_BIBLE_API_BASE ||
      "https://bible-api.com",
  ) {}

  async fetchByReference(reference: string): Promise<Verse> {
    const url = `${this.baseUrl.replace(/\/$/, "")}/${encodeURIComponent(reference)}?translation=cuv`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`bible-api error: ${res.status}`);
    }
    const data = (await res.json()) as BibleApiResponse;
    const first = data.verses?.[0];
    const text = (data.text ?? first?.text ?? "").replace(/\s+/g, " ").trim();
    if (!text) {
      throw new Error("bible-api: empty text");
    }

    const book = first?.book_name ?? "Unknown";
    const chapter = first?.chapter ?? 0;
    const verseStart = first?.verse ?? 0;
    const last = data.verses?.[data.verses.length - 1];
    const verseEnd = last?.verse;

    const verse: Verse = {
      id: `${book}.${chapter}.${verseStart}@cuv`,
      reference: data.reference ?? `${book} ${chapter}:${verseStart}`,
      text,
      translation: "cuv",
      book,
      chapter,
      verseStart,
      source: "bible-api",
    };
    if (verseEnd !== undefined && verseEnd !== verseStart) {
      verse.verseEnd = verseEnd;
    }
    return verse;
  }
}
