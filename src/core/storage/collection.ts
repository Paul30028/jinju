import type { CollectionItem, Verse } from "../types";
import { migrateStripHeavyPreviews, safeGetJson, safeSetJson } from "./safe-storage";

const COLLECTION_KEY = "jinju-ri:collection:v1";
const MAX_ITEMS = 200;

export interface CollectionRecord extends CollectionItem {
  verse: Verse;
  /** 已弃用：不存 base64 大图 */
  previewDataUrl?: string;
}

function readAll(): CollectionRecord[] {
  migrateStripHeavyPreviews();
  const parsed = safeGetJson<CollectionRecord[]>(COLLECTION_KEY, []);
  return Array.isArray(parsed) ? parsed.map(slimRecord) : [];
}

function slimRecord(item: CollectionRecord): CollectionRecord {
  const next: CollectionRecord = {
    id: item.id,
    verseId: item.verseId,
    verse: item.verse,
    createdAt: item.createdAt,
  };
  if (item.verseOfDayId !== undefined) next.verseOfDayId = item.verseOfDayId;
  if (item.note !== undefined) next.note = item.note;
  return next;
}

function writeAll(items: CollectionRecord[]): void {
  safeSetJson(COLLECTION_KEY, items.slice(0, MAX_ITEMS).map(slimRecord));
}

export function listCollection(): CollectionRecord[] {
  return readAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function isCollected(verseId: string): boolean {
  return readAll().some((item) => item.verseId === verseId);
}

export function addToCollection(input: {
  verse: Verse;
  verseOfDayId?: string;
  note?: string;
  previewDataUrl?: string;
}): CollectionRecord {
  const all = readAll().filter((i) => i.verseId !== input.verse.id);
  const record: CollectionRecord = {
    id: `col_${input.verse.id}_${Date.now()}`,
    verseId: input.verse.id,
    verse: input.verse,
    createdAt: new Date().toISOString(),
  };
  if (input.verseOfDayId !== undefined) {
    record.verseOfDayId = input.verseOfDayId;
  }
  if (input.note !== undefined) {
    record.note = input.note;
  }
  all.unshift(record);
  writeAll(all);
  return record;
}

export function removeFromCollection(verseId: string): void {
  writeAll(readAll().filter((i) => i.verseId !== verseId));
}

export function toggleCollection(input: {
  verse: Verse;
  verseOfDayId?: string;
  previewDataUrl?: string;
}): { collected: boolean } {
  if (isCollected(input.verse.id)) {
    removeFromCollection(input.verse.id);
    return { collected: false };
  }
  addToCollection({
    verse: input.verse,
    ...(input.verseOfDayId ? { verseOfDayId: input.verseOfDayId } : {}),
    // 忽略 previewDataUrl
  });
  return { collected: true };
}
