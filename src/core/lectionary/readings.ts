import data from "../../data/lectionary-readings.json";
import type { LectionaryYear, LiturgicalContext } from "./calendar";
import { getLiturgicalContext } from "./calendar";
import type { Verse } from "../types";
import { createCustomVerse } from "../verse/custom";

export interface LectionaryReading {
  slot: string;
  reference: string;
  text: string;
}

export interface LectionaryPack {
  title: string;
  year: LectionaryYear;
  weekKey: string;
  seasonLabel: string;
  label: string;
  readings: LectionaryReading[];
  /** 是否使用 exact week 匹配；否则为季节/常年期默认 */
  exact: boolean;
}

type YearTable = Record<string, { title: string; readings: LectionaryReading[] }>;

const TABLE = data as Record<LectionaryYear, YearTable>;

export function getReadingsForDate(date?: string): LectionaryPack {
  const ctx = getLiturgicalContext(date ?? new Date());
  return resolvePack(ctx);
}

function resolvePack(ctx: LiturgicalContext): LectionaryPack {
  const yearTable = TABLE[ctx.lectionaryYear];
  const exact = yearTable[ctx.weekKey];
  if (exact) {
    return {
      title: exact.title,
      year: ctx.lectionaryYear,
      weekKey: ctx.weekKey,
      seasonLabel: ctx.seasonLabel,
      label: ctx.label,
      readings: exact.readings,
      exact: true,
    };
  }

  // 渐进回退：本季第 1 周 → 季节默认 → 常年期默认
  const seasonFallbacks: Record<string, string[]> = {
    advent: ["advent-1"],
    christmas: ["christmas"],
    epiphany: ["epiphany-1", "ordinary-default"],
    lent: ["lent-1", "ordinary-default"],
    easter: ["easter-1", "ordinary-default"],
    pentecost: ["pentecost"],
    ordinary: ["ordinary-default"],
  };

  // ordinary-N：精确 → 递减邻近周 → 默认
  if (ctx.weekKey.startsWith("ordinary-")) {
    const n = Number(ctx.weekKey.replace("ordinary-", "")) || 1;
    const tryKeys = [
      ctx.weekKey,
      ...Array.from({ length: Math.min(n, 16) }, (_, i) => `ordinary-${n - i}`),
      "ordinary-16",
      "ordinary-12",
      "ordinary-8",
      "ordinary-4",
      "ordinary-1",
      "ordinary-default",
    ];
    const seen = new Set<string>();
    for (const k of tryKeys) {
      if (seen.has(k)) continue;
      seen.add(k);
      const p = yearTable[k];
      if (p) {
        return {
          title:
            k === ctx.weekKey ? p.title : `${p.title}（本周延伸）`,
          year: ctx.lectionaryYear,
          weekKey: ctx.weekKey,
          seasonLabel: ctx.seasonLabel,
          label: ctx.label,
          readings: p.readings,
          exact: k === ctx.weekKey,
        };
      }
    }
  }

  // 特殊日回退
  if (
    ctx.weekKey === "trinity" ||
    ctx.weekKey === "christ-the-king" ||
    ctx.weekKey === "ash-wednesday"
  ) {
    const p = yearTable[ctx.weekKey] ?? yearTable["ordinary-default"];
    if (p) {
      return {
        title: p.title,
        year: ctx.lectionaryYear,
        weekKey: ctx.weekKey,
        seasonLabel: ctx.seasonLabel,
        label: ctx.label,
        readings: p.readings,
        exact: !!yearTable[ctx.weekKey],
      };
    }
  }

  const keys = seasonFallbacks[ctx.season] ?? ["ordinary-default"];
  for (const key of keys) {
    const pack = yearTable[key];
    if (pack) {
      return {
        title: `${pack.title}（本周延伸）`,
        year: ctx.lectionaryYear,
        weekKey: ctx.weekKey,
        seasonLabel: ctx.seasonLabel,
        label: ctx.label,
        readings: pack.readings,
        exact: false,
      };
    }
  }

  const pack = yearTable["ordinary-default"]!;
  return {
    title: `${pack.title}（本周延伸）`,
    year: ctx.lectionaryYear,
    weekKey: ctx.weekKey,
    seasonLabel: ctx.seasonLabel,
    label: ctx.label,
    readings: pack.readings,
    exact: false,
  };
}

export function readingToVerse(reading: LectionaryReading): Verse {
  return createCustomVerse({
    text: reading.text,
    reference: reading.reference,
  });
}
