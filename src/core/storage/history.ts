import type { GeneratedImageMeta, VerseOfDay } from "../types";
import { migrateStripHeavyPreviews, safeGetJson, safeSetJson } from "./safe-storage";

const HISTORY_KEY = "jinju-ri:history:v1";
const MAX_ITEMS = 40;

export interface HistoryEntry {
  verseOfDay: VerseOfDay;
  /** 已弃用：勿再写入 data URL，避免 localStorage 配额爆炸 */
  previewDataUrl?: string;
  lastMeta?: GeneratedImageMeta;
  savedAt: string;
}

function readAll(): HistoryEntry[] {
  migrateStripHeavyPreviews();
  const parsed = safeGetJson<HistoryEntry[]>(HISTORY_KEY, []);
  return Array.isArray(parsed) ? parsed.map(slimEntry) : [];
}

function slimEntry(entry: HistoryEntry): HistoryEntry {
  const next: HistoryEntry = {
    verseOfDay: entry.verseOfDay,
    savedAt: entry.savedAt,
  };
  if (entry.lastMeta) {
    next.lastMeta = entry.lastMeta;
  }
  // 故意不保留 previewDataUrl
  return next;
}

function writeAll(entries: HistoryEntry[]): void {
  safeSetJson(HISTORY_KEY, entries.slice(0, MAX_ITEMS).map(slimEntry));
}

export function upsertHistory(entry: HistoryEntry): void {
  const slim = slimEntry(entry);
  const all = readAll().filter((e) => e.verseOfDay.id !== slim.verseOfDay.id);
  all.unshift(slim);
  writeAll(all);
}

export function listHistory(): HistoryEntry[] {
  return readAll().sort((a, b) => (a.verseOfDay.date < b.verseOfDay.date ? 1 : -1));
}

export function getHistoryByDate(date: string): HistoryEntry | undefined {
  return readAll().find((e) => e.verseOfDay.date === date);
}

export function removeHistoryByDate(date: string): void {
  writeAll(readAll().filter((e) => e.verseOfDay.date !== date));
}

export function removeHistoryById(id: string): void {
  writeAll(readAll().filter((e) => e.verseOfDay.id !== id));
}

export function clearHistory(): void {
  writeAll([]);
}
