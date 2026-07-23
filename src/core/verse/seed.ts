import seed from "../../data/verses-cuv-seed.json";
import type { TranslationCode, Verse } from "../types";

export interface SeedVerseRow {
  book: string;
  bookEn: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  text: string;
  reference: string;
}

const rows = seed as SeedVerseRow[];

export function seedToVerse(
  row: SeedVerseRow,
  translation: TranslationCode = "cuv",
): Verse {
  const end = row.verseEnd ?? row.verseStart;
  const id = `${row.bookEn}.${row.chapter}.${row.verseStart}${
    end !== row.verseStart ? `-${end}` : ""
  }@${translation}`;

  const verse: Verse = {
    id,
    reference: row.reference,
    referenceEn: `${row.bookEn} ${row.chapter}:${row.verseStart}${
      end !== row.verseStart ? `-${end}` : ""
    }`,
    text: row.text,
    translation,
    book: row.book,
    chapter: row.chapter,
    verseStart: row.verseStart,
    source: "local",
  };

  if (row.verseEnd !== undefined) {
    verse.verseEnd = row.verseEnd;
  }

  return verse;
}

export function getLocalCuvPool(): Verse[] {
  return rows.map((row) => seedToVerse(row, "cuv"));
}
