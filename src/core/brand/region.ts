/**
 * Serein 双版本品牌
 * - cn   中国区（主商店名：Serein 静澄）
 * - intl 国际区（主商店名：Serein）
 *
 * 构建时：VITE_APP_REGION=cn|intl
 * 默认：cn（兼容现有用户习惯）
 */

export type AppRegion = "cn" | "intl";

export interface BrandProfile {
  region: AppRegion;
  /** 全球主品牌（不变） */
  masterBrand: "Serein";
  /** 应用显示名（桌面 / 顶栏 / 系统分享标题） */
  displayName: string;
  /** 短名（PWA short_name、水印） */
  shortName: string;
  /** Android / iOS applicationId */
  appId: string;
  /** 默认 UI 语言 */
  defaultLocale: "zh" | "en";
  themeColor: string;
  backgroundColor: string;
  splashColor: string;
  /** public 路径下的 favicon */
  favicon: string;
  /** 品牌主色（CSS 变量可选用） */
  colors: {
    primary: string;
    accent: string;
    deep: string;
  };
  /** 多语言副标题（顶栏 brand-sub） */
  tagline: {
    zh: string;
    en: string;
    de: string;
    fr: string;
  };
  /** 商店用一句话 */
  storeBlurb: {
    zh: string;
    en: string;
    de: string;
    fr: string;
  };
}

const CN: BrandProfile = {
  region: "cn",
  masterBrand: "Serein",
  displayName: "Serein 静澄",
  shortName: "静澄",
  appId: "app.serein.cn",
  defaultLocale: "zh",
  themeColor: "#1a3a38",
  backgroundColor: "#f5f2ec",
  splashColor: "#f5f2ec",
  favicon: "/brand/favicon-cn.svg",
  colors: {
    primary: "#1a3a38",
    accent: "#c4a574",
    deep: "#0f2422",
  },
  tagline: {
    zh: "每日一句 · 安静留白",
    en: "One quiet line a day",
    de: "Ein stiller Satz am Tag",
    fr: "Une ligne calme par jour",
  },
  storeBlurb: {
    zh: "Serein 静澄 — 每日一句，安静成图，可保存分享。",
    en: "Serein — one quiet line a day. Make, save, share.",
    de: "Serein — ein stiller Satz am Tag. Erstellen, speichern, teilen.",
    fr: "Serein — une ligne calme par jour. Créer, enregistrer, partager.",
  },
};

const INTL: BrandProfile = {
  region: "intl",
  masterBrand: "Serein",
  displayName: "Serein",
  shortName: "Serein",
  appId: "app.serein.day",
  defaultLocale: "en",
  themeColor: "#0e2a3a",
  backgroundColor: "#f4f7f8",
  splashColor: "#f4f7f8",
  favicon: "/brand/favicon-intl.svg",
  colors: {
    primary: "#0e3a45",
    accent: "#6ee7c5",
    deep: "#071820",
  },
  tagline: {
    zh: "每日一句 · 安静",
    en: "One quiet line a day",
    de: "Ein stiller Satz am Tag",
    fr: "Une ligne calme par jour",
  },
  storeBlurb: {
    zh: "Serein — 每日一句，安静成图。",
    en: "Serein — one quiet line a day. Make beautiful cards and share.",
    de: "Serein — ein stiller Satz am Tag. Karten erstellen und teilen.",
    fr: "Serein — une ligne calme par jour. Créez et partagez.",
  },
};

export const BRANDS: Record<AppRegion, BrandProfile> = {
  cn: CN,
  intl: INTL,
};

export function resolveAppRegion(
  raw?: string | null | undefined,
): AppRegion {
  const v = (raw || "").trim().toLowerCase();
  if (v === "intl" || v === "international" || v === "global" || v === "en") {
    return "intl";
  }
  return "cn";
}

/** 当前构建区域（Vite 注入） */
export function getAppRegion(): AppRegion {
  try {
    return resolveAppRegion(import.meta.env.VITE_APP_REGION as string | undefined);
  } catch {
    return "cn";
  }
}

export function getBrand(region?: AppRegion): BrandProfile {
  return BRANDS[region ?? getAppRegion()];
}
