/**
 * 共同经课 / 三代经课（RCL）历法工具
 * Year A / B / C 循环，以将临期第一主日为新年起点
 */

export type LectionaryYear = "A" | "B" | "C";

export type LiturgicalSeason =
  | "advent"
  | "christmas"
  | "epiphany"
  | "lent"
  | "easter"
  | "pentecost"
  | "ordinary";

export interface LiturgicalContext {
  date: string; // YYYY-MM-DD
  lectionaryYear: LectionaryYear;
  /** 将临期起点所属的公历年（如 2025-07 属于 2024 将临期开启的 Year C 年…） */
  adventStartYear: number;
  season: LiturgicalSeason;
  seasonLabel: string;
  /** 大致主日序号（用于匹配表） */
  weekKey: string;
  label: string;
}

const SEASON_LABEL: Record<LiturgicalSeason, string> = {
  advent: "将临期",
  christmas: "圣诞期",
  epiphany: "显现期",
  lent: "大斋期",
  easter: "复活期",
  pentecost: "圣灵降临",
  ordinary: "常年期",
};

/** 将临期第一主日：最接近 11/30 的主日，范围 11/27–12/3 */
export function getAdventSunday(year: number): Date {
  // 找 11/27 到 12/3 之间的周日
  for (let day = 27; day <= 33; day++) {
    const month = day <= 30 ? 10 : 11; // 0-based: 10=Nov, 11=Dec
    const d = day <= 30 ? day : day - 30;
    const date = new Date(year, month, d);
    if (date.getDay() === 0) return startOfDay(date);
  }
  return startOfDay(new Date(year, 10, 30));
}

/**
 * Advent 2016 → Year A, 2017 → B, 2018 → C, …
 */
export function yearLetterForAdventStart(adventStartYear: number): LectionaryYear {
  const mod = ((adventStartYear - 2016) % 3 + 3) % 3;
  return mod === 0 ? "A" : mod === 1 ? "B" : "C";
}

export function getLiturgicalContext(dateInput: Date | string): LiturgicalContext {
  const date =
    typeof dateInput === "string" ? parseYmd(dateInput) : startOfDay(dateInput);
  const y = date.getFullYear();
  const adventThis = getAdventSunday(y);
  const adventStartYear = date >= adventThis ? y : y - 1;
  const adventStart = getAdventSunday(adventStartYear);
  const nextAdvent = getAdventSunday(adventStartYear + 1);
  const lectionaryYear = yearLetterForAdventStart(adventStartYear);

  const christmas = startOfDay(new Date(adventStartYear, 11, 25));
  const epiphany = startOfDay(new Date(adventStartYear + 1, 0, 6));
  // Easter approx via anonymous Gregorian algorithm for adventStartYear+1 spring
  const easter = computeEaster(adventStartYear + 1);
  const ashWednesday = addDays(easter, -46);
  const pentecost = addDays(easter, 49);

  const trinity = addDays(pentecost, 7); // 圣灵降临后的主日 = 圣三一
  // 基督君王：将临期前最后一个主日
  const christTheKing = addDays(nextAdvent, -7);

  let season: LiturgicalSeason = "ordinary";
  if (date >= adventStart && date < christmas) season = "advent";
  else if (date >= christmas && date < epiphany) season = "christmas";
  else if (date >= epiphany && date < ashWednesday) season = "epiphany";
  else if (date >= ashWednesday && date < easter) season = "lent";
  else if (date >= easter && date < pentecost) season = "easter";
  else if (date >= pentecost && date < addDays(pentecost, 7)) season = "pentecost";
  else season = "ordinary";

  const weekKey = buildWeekKey(
    date,
    season,
    adventStart,
    easter,
    ashWednesday,
    nextAdvent,
    pentecost,
    trinity,
    christTheKing,
  );

  const specialLabel =
    weekKey === "ash-wednesday"
      ? "圣灰日"
      : weekKey === "trinity"
        ? "圣三一主日"
        : weekKey === "christ-the-king"
          ? "基督君王主日"
          : null;
  const label = specialLabel
    ? `${specialLabel} · 经课年 ${lectionaryYear}`
    : `${SEASON_LABEL[season]} · 经课年 ${lectionaryYear}`;

  return {
    date: formatYmd(date),
    lectionaryYear,
    adventStartYear,
    season,
    seasonLabel: specialLabel ?? SEASON_LABEL[season],
    weekKey,
    label,
  };
}

function buildWeekKey(
  date: Date,
  season: LiturgicalSeason,
  adventStart: Date,
  easter: Date,
  ashWednesday: Date,
  nextAdvent: Date,
  pentecost: Date,
  trinity: Date,
  christTheKing: Date,
): string {
  // 特殊日优先（有独立读经包）
  if (sameDay(date, ashWednesday)) return "ash-wednesday";
  if (sameDay(date, trinity) || (date > pentecost && date < addDays(trinity, 7))) {
    // 圣三一当周
    if (date >= trinity && date < addDays(trinity, 7)) return "trinity";
  }
  if (date >= christTheKing && date < nextAdvent) return "christ-the-king";

  if (season === "advent") {
    const w = Math.floor(daysBetween(adventStart, date) / 7) + 1;
    return `advent-${clamp(w, 1, 4)}`;
  }
  if (season === "christmas") return "christmas";
  if (season === "epiphany") {
    const w = Math.floor(daysBetween(new Date(date.getFullYear(), 0, 6), date) / 7) + 1;
    return `epiphany-${clamp(w, 1, 9)}`;
  }
  if (season === "lent") {
    const w = Math.floor(daysBetween(ashWednesday, date) / 7) + 1;
    return `lent-${clamp(w, 1, 6)}`;
  }
  if (season === "easter") {
    const w = Math.floor(daysBetween(easter, date) / 7) + 1;
    return `easter-${clamp(w, 1, 7)}`;
  }
  if (season === "pentecost") return "pentecost";

  // 常年期：圣灵降临后（三一之后）至基督君王前
  const ordinaryStart = addDays(trinity, 7);
  if (date < ordinaryStart) return "trinity";
  const w = Math.floor(daysBetween(ordinaryStart, date) / 7) + 1;
  if (date >= nextAdvent) return "ordinary-1";
  return `ordinary-${clamp(w, 1, 34)}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Anonymous Gregorian algorithm for Easter Sunday */
export function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return startOfDay(new Date(year, month - 1, day));
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return startOfDay(x);
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return startOfDay(new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}
