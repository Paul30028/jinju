/**
 * 原生/Web 统一入口（兼容旧 import）
 * 完整多平台请用 ShareSheet + shareToTarget
 */
import type { BilingualMode, Verse } from "../types";
import { shareVerseImage } from "../share/service";

export async function shareVerseImageNative(options: {
  blob: Blob;
  filename: string;
  verse: Verse;
  mode: BilingualMode;
}): Promise<"shared" | "downloaded" | "copied" | "cancelled"> {
  return shareVerseImage(options);
}
