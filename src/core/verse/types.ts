import type { TranslationCode, Verse } from "../types";

/** 可插拔经文提供方 — 新增译本只加 Adapter，不改调用方 */
export interface VerseProvider {
  readonly id: string;
  readonly translation: TranslationCode;
  /** 按标准引用拉取，如 John 3:16 */
  fetchByReference(reference: string): Promise<Verse>;
  /** 可选：按日期返回候选（远程日更）；无则由本地 Selector 选题 */
  fetchDailyCandidate?(date: string): Promise<Verse | null>;
}
