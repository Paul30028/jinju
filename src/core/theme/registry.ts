import type { LayoutTemplate, Theme } from "../types";
import { hashDateSeed } from "../hash";

/** 免费版主题（全部 free） */
export const THEMES: Record<string, Theme> = {
  dawn: {
    id: "dawn",
    name: "黎明",
    tier: "free",
    colors: {
      bg: "#f3ebe0",
      fg: "#2a322e",
      muted: "#6d736e",
      accent: "#9a7b4f",
      meta: "#5c635e",
    },
    fonts: {
      verse: "Noto Serif SC, Source Han Serif SC, STSong, serif",
      meta: "Noto Sans SC, Microsoft YaHei, sans-serif",
    },
    backgroundStyle: {
      type: "gradient",
      css: "linear-gradient(165deg, #f7f0e6 0%, #e8dcc8 42%, #c9d5c8 100%)",
    },
    overlay: {
      scrim: 0.12,
      textShadow: "0 2px 18px rgba(255,255,255,0.45), 0 1px 2px rgba(42,50,46,0.25)",
    },
  },
  night: {
    id: "night",
    name: "静夜",
    tier: "free",
    colors: {
      bg: "#1a2228",
      fg: "#f0ebe3",
      muted: "#a8b0aa",
      accent: "#c4a574",
      meta: "#c5ccc6",
    },
    fonts: {
      verse: "Noto Serif SC, Source Han Serif SC, STSong, serif",
      meta: "Noto Sans SC, Microsoft YaHei, sans-serif",
    },
    backgroundStyle: {
      type: "gradient",
      css: "linear-gradient(160deg, #141c22 0%, #24343d 48%, #1e2a28 100%)",
    },
    overlay: {
      scrim: 0.28,
      textShadow: "0 2px 16px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.8)",
    },
  },
  wilderness: {
    id: "wilderness",
    name: "旷野",
    tier: "free",
    colors: {
      bg: "#ebe4d6",
      fg: "#3a3228",
      muted: "#7a7166",
      accent: "#8b6b45",
      meta: "#5e564c",
    },
    fonts: {
      verse: "Noto Serif SC, Source Han Serif SC, STSong, serif",
      meta: "Noto Sans SC, Microsoft YaHei, sans-serif",
    },
    backgroundStyle: {
      type: "gradient",
      css: "linear-gradient(150deg, #f0e8d8 0%, #d9c4a5 50%, #b7a68a 100%)",
    },
    overlay: {
      scrim: 0.14,
      textShadow: "0 2px 14px rgba(255,252,245,0.4), 0 1px 2px rgba(58,50,40,0.22)",
    },
  },
  mist: {
    id: "mist",
    name: "晨雾",
    tier: "free",
    colors: {
      bg: "#e8eef0",
      fg: "#2a3438",
      muted: "#667278",
      accent: "#6a8a8e",
      meta: "#556066",
    },
    fonts: {
      verse: "Noto Serif SC, Source Han Serif SC, STSong, serif",
      meta: "Noto Sans SC, Microsoft YaHei, sans-serif",
    },
    backgroundStyle: {
      type: "gradient",
      css: "linear-gradient(170deg, #f2f6f7 0%, #d5e0e4 50%, #c5d4d0 100%)",
    },
    overlay: {
      scrim: 0.1,
      textShadow: "0 2px 16px rgba(255,255,255,0.5)",
    },
  },
  parchment: {
    id: "parchment",
    name: "书卷",
    tier: "free",
    colors: {
      bg: "#f2e6d0",
      fg: "#3d2f22",
      muted: "#7a6a56",
      accent: "#a67c4e",
      meta: "#5c4e3e",
    },
    fonts: {
      verse: "Noto Serif SC, Source Han Serif SC, STSong, serif",
      meta: "Noto Sans SC, Microsoft YaHei, sans-serif",
    },
    backgroundStyle: {
      type: "gradient",
      css: "linear-gradient(155deg, #f7ecda 0%, #e8d5b5 55%, #d4bc94 100%)",
    },
    overlay: {
      scrim: 0.08,
      textShadow: "0 1px 2px rgba(61,47,34,0.2)",
    },
  },
  /** 圣所：紫金礼仪感 */
  sanctuary: {
    id: "sanctuary",
    name: "圣所",
    tier: "free",
    colors: {
      bg: "#1e1830",
      fg: "#f3ebe0",
      muted: "#b8aec8",
      accent: "#c9a86c",
      meta: "#cfc4b0",
    },
    fonts: {
      verse: "Noto Serif SC, Source Han Serif SC, STSong, serif",
      meta: "Noto Sans SC, Microsoft YaHei, sans-serif",
    },
    backgroundStyle: {
      type: "gradient",
      css: "linear-gradient(160deg, #1a1428 0%, #2d2450 45%, #1f1838 100%)",
    },
    overlay: {
      scrim: 0.22,
      textShadow: "0 2px 16px rgba(0,0,0,0.5)",
    },
  },
  /** 橄榄：客西马尼/平安绿 */
  olive: {
    id: "olive",
    name: "橄榄",
    tier: "free",
    colors: {
      bg: "#e8efe4",
      fg: "#2a3528",
      muted: "#6a7a64",
      accent: "#7a9a5a",
      meta: "#5a6a54",
    },
    fonts: {
      verse: "Noto Serif SC, Source Han Serif SC, STSong, serif",
      meta: "Noto Sans SC, Microsoft YaHei, sans-serif",
    },
    backgroundStyle: {
      type: "gradient",
      css: "linear-gradient(165deg, #f0f5eb 0%, #d4e0c8 50%, #a8c090 100%)",
    },
    overlay: {
      scrim: 0.1,
      textShadow: "0 2px 12px rgba(255,255,255,0.4)",
    },
  },
  /** 活水：加利利海/清澈水流 */
  river: {
    id: "river",
    name: "活水",
    tier: "free",
    colors: {
      bg: "#e4f0f5",
      fg: "#1a2e38",
      muted: "#5a7a88",
      accent: "#4a90a8",
      meta: "#4a6870",
    },
    fonts: {
      verse: "Noto Serif SC, Source Han Serif SC, STSong, serif",
      meta: "Noto Sans SC, Microsoft YaHei, sans-serif",
    },
    backgroundStyle: {
      type: "gradient",
      css: "linear-gradient(170deg, #eef6fa 0%, #b8d4e4 48%, #6a9eb8 100%)",
    },
    overlay: {
      scrim: 0.12,
      textShadow: "0 2px 14px rgba(255,255,255,0.45)",
    },
  },
};

/**
 * 免费版 6 种海报版式（每日轮换）
 * 参考主流圣经 App 金句海报：框线、胶囊出处、多色背景
 */
export const TEMPLATES: Record<string, LayoutTemplate> = {
  center: {
    id: "center",
    name: "经典居中",
    layout: "center",
    tier: "free",
    paddingRatio: 0.1,
    verseFontSizeRange: [34, 58],
    maxLines: 12,
  },
  "center-quote": {
    id: "center-quote",
    name: "引号海报",
    layout: "center-quote",
    tier: "free",
    paddingRatio: 0.12,
    verseFontSizeRange: [32, 54],
    maxLines: 11,
  },
  "top-bottom": {
    id: "top-bottom",
    name: "上沉浸",
    layout: "top-bottom",
    tier: "free",
    paddingRatio: 0.1,
    verseFontSizeRange: [32, 52],
    maxLines: 11,
  },
  bottom: {
    id: "bottom",
    name: "玻璃底卡",
    layout: "bottom",
    tier: "free",
    paddingRatio: 0.1,
    verseFontSizeRange: [32, 50],
    maxLines: 11,
  },
  "left-right": {
    id: "left-right",
    name: "侧栏海报",
    layout: "left-right",
    tier: "free",
    paddingRatio: 0.08,
    verseFontSizeRange: [30, 48],
    maxLines: 14,
  },
  "left-rail": {
    id: "left-rail",
    name: "金轨侧排",
    layout: "left-rail",
    tier: "free",
    paddingRatio: 0.09,
    verseFontSizeRange: [30, 48],
    maxLines: 14,
  },
};

const THEME_IDS = Object.keys(THEMES);
const TEMPLATE_IDS = Object.keys(TEMPLATES);

/** 免费版：仅在 free 池内按日期轮换 */
export function pickDailyPresentation(date: string): {
  themeId: string;
  templateId: string;
  themeName: string;
  templateName: string;
} {
  const themeId =
    THEME_IDS[hashDateSeed(date, "free-theme-v1") % THEME_IDS.length] ?? "dawn";
  const templateId =
    TEMPLATE_IDS[hashDateSeed(date, "free-layout-v1") % TEMPLATE_IDS.length] ??
    "center";
  return {
    themeId,
    templateId,
    themeName: resolveTheme(themeId).name,
    templateName: resolveTemplate(templateId).name,
  };
}

export function resolveTheme(themeId: string): Theme {
  return THEMES[themeId] ?? THEMES.dawn!;
}

export function resolveTemplate(templateId: string): LayoutTemplate {
  // 兼容旧 id（vertical-rl 等）与空值
  if (templateId && TEMPLATES[templateId]) {
    return TEMPLATES[templateId]!;
  }
  return TEMPLATES.center!;
}

export function listThemes(): Theme[] {
  return Object.values(THEMES);
}

export function listTemplates(): LayoutTemplate[] {
  return Object.values(TEMPLATES);
}

export function listFreeTemplates(): LayoutTemplate[] {
  return listTemplates().filter((t) => t.tier === "free");
}
