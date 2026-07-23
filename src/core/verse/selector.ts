import type { Verse, VerseOfDay } from "../types";
import { getTodayKey } from "../scheduler";
import { LocalCuvProvider } from "./local-provider";
import { pickDailyPresentation } from "../theme";
import { hashDateSeed } from "../hash";
import { attachEnglish } from "./bilingual";

export { hashDateSeed } from "../hash";

export function pickVerseForDate(
  pool: readonly Verse[],
  date: string,
  salt?: string,
): Verse {
  if (pool.length === 0) {
    throw new Error("Verse pool is empty");
  }
  const idx = hashDateSeed(date, salt) % pool.length;
  const verse = pool[idx];
  if (!verse) {
    throw new Error("Verse index out of range");
  }
  return attachEnglish(verse);
}

export interface SelectVerseOfDayOptions {
  date?: string;
  timezone?: string;
  themeId?: string;
  templateId?: string;
  autoLayout?: boolean;
  pool?: readonly Verse[];
}

/** 免费版：经文 + 英文 + 每日版式/主题自动轮换 */
export function selectVerseOfDay(
  options: SelectVerseOfDayOptions = {},
): VerseOfDay {
  const timezone = options.timezone ?? "Asia/Shanghai";
  const date = options.date ?? getTodayKey(timezone);
  const provider = new LocalCuvProvider();
  const pool = options.pool ?? provider.getPool();
  const verse = pickVerseForDate(pool, date);

  const autoLayout = options.autoLayout !== false;
  const daily = pickDailyPresentation(date);
  // 自动模式强制用当日轮换；手动模式才读用户偏好（并清洗非法旧 id）
  const rawTheme = autoLayout ? daily.themeId : (options.themeId || "dawn");
  const rawTemplate = autoLayout
    ? daily.templateId
    : (options.templateId || "center");
  const themeId = rawTheme || "dawn";
  const freeIds = new Set([
    "center",
    "center-quote",
    "top-bottom",
    "bottom",
    "left-right",
    "left-rail",
  ]);
  const templateId = freeIds.has(rawTemplate) ? rawTemplate : daily.templateId;

  return {
    id: `${date}_${verse.translation}_${verse.id}`,
    date,
    verse,
    themeId,
    templateId,
    createdAt: new Date().toISOString(),
  };
}
