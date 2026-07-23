/** 领域类型 — 免费版 V1 核心 */

export type TranslationCode = "cuv" | "esv" | "niv" | (string & {});

export type VerseSource = "bible-api" | "helloao" | "local";

export type BilingualMode = "zh-en" | "zh" | "en";

export type SpiritualTopic =
  | "hope"
  | "comfort"
  | "faith"
  | "strength"
  | "wisdom"
  | "gratitude"
  | "presence"
  | "salvation"
  | "love"
  | "joy"
  | "peace"
  | "patience"
  | "kindness"
  | "goodness"
  | "faithfulness"
  | "gentleness"
  | "self_control";

export interface VerseLocale {
  text: string;
  reference: string;
  translation: TranslationCode;
}

export interface Verse {
  id: string;
  reference: string;
  referenceEn?: string;
  text: string;
  translation: TranslationCode;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  source: VerseSource;
  topics?: SpiritualTopic[];
  /** 英文副文（免费版 ESV 本地对照） */
  en?: VerseLocale;
}

export interface VerseOfDay {
  id: string;
  date: string;
  verse: Verse;
  themeId: string;
  templateId: string;
  createdAt: string;
}

export type ImageSizeName = "story" | "square" | "landscape";

export interface ImageSize {
  name: ImageSizeName;
  width: number;
  height: number;
}

export const IMAGE_SIZES: Record<ImageSizeName, ImageSize> = {
  story: { name: "story", width: 1080, height: 1920 },
  square: { name: "square", width: 1080, height: 1080 },
  landscape: { name: "landscape", width: 1920, height: 1080 },
};

/** 免费版 6 种版式 */
export type LayoutKind =
  | "center"
  | "center-quote"
  | "top-bottom"
  | "bottom"
  | "left-right"
  | "left-rail";

export interface LayoutTemplate {
  id: string;
  name: string;
  layout: LayoutKind;
  tier: "free";
  paddingRatio: number;
  verseFontSizeRange: readonly [number, number];
  maxLines: number;
}

export interface ThemeColors {
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  meta: string;
}

export interface ThemeFonts {
  verse: string;
  meta: string;
}

export type BackgroundStyle =
  | { type: "gradient"; css: string }
  | { type: "image"; url: string };

export interface Theme {
  id: string;
  name: string;
  tier: "free";
  colors: ThemeColors;
  fonts: ThemeFonts;
  backgroundStyle: BackgroundStyle;
  overlay: {
    scrim: number;
    textShadow: string;
  };
}

/** App 壳配色：跟随系统 / 浅色 / 深色 */
export type ColorSchemePref = "system" | "light" | "dark";

/** 软件界面语言（与经文中英显示分开） */
export type AppLocalePref = "zh" | "en" | "de" | "fr";

export interface UserPreferences {
  translation: TranslationCode;
  enTranslation: "esv";
  bilingualMode: BilingualMode;
  themeId: string;
  defaultSize: ImageSizeName;
  defaultTemplateId: string;
  autoDailyLayout: boolean;
  /** 使用免费在线摄影图作背景（失败则回退程序渐变） */
  usePhotoBackground: boolean;
  reduceMotion: boolean;
  notifyEnabled: boolean;
  timezone: string;
  /** UI 明暗：默认跟随系统 */
  colorScheme: ColorSchemePref;
  /** 软件系统语言：中 / 英 / 德 / 法 */
  appLocale: AppLocalePref;
}

export interface CollectionItem {
  id: string;
  verseId: string;
  verseOfDayId?: string;
  note?: string;
  createdAt: string;
}

export interface GeneratedImageMeta {
  id: string;
  verseOfDayId: string;
  width: number;
  height: number;
  templateId: string;
  themeId: string;
  createdAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  translation: "cuv",
  enTranslation: "esv",
  bilingualMode: "zh-en",
  themeId: "dawn",
  defaultSize: "story",
  defaultTemplateId: "center",
  autoDailyLayout: true,
  usePhotoBackground: true,
  reduceMotion: false,
  notifyEnabled: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai",
  colorScheme: "system",
  appLocale: "zh",
};
