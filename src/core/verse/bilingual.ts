import esvMap from "../../data/verses-esv-map.json";
import type { Verse, VerseLocale } from "../types";

const ESV = esvMap as Record<string, string>;

/** 规范化英文出处键，便于查表 */
export function normalizeEnRefKey(key: string): string {
  return key
    .replace(/\s+/g, " ")
    .replace(/：/g, ":")
    .replace(/～|—|–/g, "-")
    .trim();
}

function candidateKeys(verse: Verse): string[] {
  const keys: string[] = [];
  if (verse.referenceEn) keys.push(verse.referenceEn);
  if (verse.en?.reference) keys.push(verse.en.reference);
  if (verse.book && verse.chapter && verse.verseStart) {
    // book 可能是中文，跳过；用 bookEn
  }
  // 从 id 里解：John.3.16@cuv
  const idPart = verse.id?.split("@")[0] || "";
  const m = idPart.match(/^([A-Za-z0-9][A-Za-z0-9\s]*?)\.(\d+)\.(\d+)(?:-(\d+))?$/);
  if (m) {
    const book = m[1]!.trim();
    const ch = m[2];
    const vs = m[3];
    const ve = m[4];
    keys.push(
      ve && ve !== vs ? `${book} ${ch}:${vs}-${ve}` : `${book} ${ch}:${vs}`,
    );
  }
  // 若 reference 已是英文形态
  if (verse.reference && /^[A-Za-z]/.test(verse.reference)) {
    keys.push(verse.reference);
  }
  return [...new Set(keys.map(normalizeEnRefKey).filter(Boolean))];
}

function lookupLocalEnglish(verse: Verse): string | undefined {
  for (const key of candidateKeys(verse)) {
    const hit = ESV[key];
    if (hit?.trim()) return hit.trim();
    // 宽松：忽略大小写
    const lower = key.toLowerCase();
    for (const [k, v] of Object.entries(ESV)) {
      if (k.toLowerCase() === lower && v?.trim()) return v.trim();
    }
  }
  return undefined;
}

/**
 * 同步附加本地 ESV 对照（有则挂 en）
 */
export function attachEnglish(verse: Verse): Verse {
  if (verse.en?.text?.trim()) return verse;
  const text = lookupLocalEnglish(verse);
  if (!text) return verse;

  const ref =
    verse.referenceEn ||
    candidateKeys(verse)[0] ||
    verse.reference ||
    "Scripture";

  const en: VerseLocale = {
    text,
    reference: ref,
    translation: "esv",
  };
  return { ...verse, en };
}

export function attachEnglishPool(pool: Verse[]): Verse[] {
  return pool.map(attachEnglish);
}

/**
 * 确保有英文：本地 ESV → 在线 World English Bible（公版，bible-api.com）
 * 仅英文 / 双语成图前调用
 */
export async function ensureEnglish(
  verse: Verse,
  options?: { timeoutMs?: number; allowNetwork?: boolean },
): Promise<Verse> {
  const local = attachEnglish(verse);
  if (local.en?.text?.trim()) return local;

  const allowNetwork = options?.allowNetwork !== false;
  if (!allowNetwork) return local;

  const ref = local.referenceEn || candidateKeys(local)[0];
  if (!ref || !/^[A-Za-z]/.test(ref)) return local;

  try {
    const text = await fetchWebEnglish(ref, options?.timeoutMs ?? 5000);
    if (!text) return local;
    return {
      ...local,
      en: {
        text,
        reference: ref,
        translation: "web",
      },
    };
  } catch {
    return local;
  }
}

async function fetchWebEnglish(
  referenceEn: string,
  timeoutMs: number,
): Promise<string | null> {
  // bible-api.com: John+3:16
  const q = encodeURIComponent(referenceEn.trim());
  const url = `https://bible-api.com/${q}?translation=web`;
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string; verses?: { text?: string }[] };
    let text = (data.text || "").replace(/\s+/g, " ").trim();
    if (!text && data.verses?.length) {
      text = data.verses
        .map((v) => (v.text || "").trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
    // 去掉 API 有时带的多余换行与节号前缀
    text = text.replace(/^\d+\s*/gm, "").replace(/\s+/g, " ").trim();
    return text.length >= 3 ? text : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** 是否已有可用英文正文 */
export function hasEnglish(verse: Verse): boolean {
  return Boolean(verse.en?.text?.trim() || lookupLocalEnglish(verse));
}
