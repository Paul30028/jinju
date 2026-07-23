import type { Verse } from "../types";

/** 用户自定义经文 → 标准 Verse（免费版可制作；后期可锁 Plus） */
export function createCustomVerse(input: {
  text: string;
  reference: string;
  textEn?: string;
}): Verse {
  const text = input.text.replace(/\s+/g, " ").trim();
  const reference = input.reference.replace(/\s+/g, " ").trim() || "自定义经文";

  if (text.length < 2) {
    throw new Error("请输入经文正文");
  }
  if (text.length > 400) {
    throw new Error("经文过长，请控制在 400 字以内");
  }

  const id = `custom.${hash(text + reference)}@cuv`;

  const verse: Verse = {
    id,
    reference,
    text,
    translation: "cuv",
    book: "自定义",
    chapter: 0,
    verseStart: 0,
    source: "local",
  };

  if (input.textEn?.trim()) {
    verse.en = {
      text: input.textEn.replace(/\s+/g, " ").trim(),
      reference: reference,
      translation: "esv",
    };
  }

  return verse;
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}
