/**
 * AI 背景 Prompt 引擎（可参数化）
 * 实际调用绘图 API 时复用 buildBackgroundPrompt；
 * MVP 先用于文档/设置预览，背景仍由本地大气渲染承担。
 */

export type PromptMood =
  | "peace"
  | "hope"
  | "comfort"
  | "awe"
  | "stillness";

export type PromptSeason =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "any";

export type PromptTime =
  | "dawn"
  | "morning"
  | "golden_hour"
  | "dusk"
  | "night";

export type PromptStyle =
  | "soft_watercolor"
  | "classical_oil"
  | "abstract_light"
  | "misty_minimal";

export interface BackgroundPromptParams {
  themeId: string;
  mood?: PromptMood;
  season?: PromptSeason;
  timeOfDay?: PromptTime;
  style?: PromptStyle;
  textSafeZone?: "center" | "lower_third" | "left_half" | "right_half";
}

const THEME_DEFAULTS: Record<
  string,
  Required<
    Pick<
      BackgroundPromptParams,
      "mood" | "season" | "timeOfDay" | "style" | "textSafeZone"
    >
  > & { palette: string }
> = {
  dawn: {
    mood: "hope",
    season: "spring",
    timeOfDay: "dawn",
    style: "soft_watercolor",
    textSafeZone: "center",
    palette: "sand and sage, ivory mist",
  },
  night: {
    mood: "stillness",
    season: "any",
    timeOfDay: "night",
    style: "abstract_light",
    textSafeZone: "center",
    palette: "deep teal dusk, soft starlight, ivory",
  },
  wilderness: {
    mood: "awe",
    season: "autumn",
    timeOfDay: "golden_hour",
    style: "classical_oil",
    textSafeZone: "lower_third",
    palette: "warm parchment, desert gold, soft umber",
  },
};

const STYLE_LABEL: Record<PromptStyle, string> = {
  soft_watercolor: "soft watercolor",
  classical_oil: "classical oil painting texture",
  abstract_light: "abstract gentle light rays",
  misty_minimal: "misty minimal atmosphere",
};

const MOOD_LABEL: Record<PromptMood, string> = {
  peace: "peace",
  hope: "hope",
  comfort: "comfort",
  awe: "reverent awe",
  stillness: "deep stillness",
};

const SEASON_LABEL: Record<PromptSeason, string> = {
  spring: "spring blossom haze",
  summer: "dry summer light",
  autumn: "autumn mist",
  winter: "winter quiet snow light",
  any: "timeless natural season",
};

const TIME_LABEL: Record<PromptTime, string> = {
  dawn: "dawn",
  morning: "soft morning",
  golden_hour: "golden hour",
  dusk: "quiet dusk",
  night: "deep night with gentle glow",
};

export const NEGATIVE_PROMPT = [
  "people",
  "human face",
  "portrait",
  "hands",
  "crowd",
  "cross",
  "crucifix",
  "church building",
  "angel",
  "halo",
  "text",
  "letters",
  "Chinese characters",
  "English words",
  "logo",
  "watermark",
  "neon",
  "cartoon",
  "anime",
  "meme",
  "commercial advertising",
  "stock photo smile",
  "busy pattern",
  "clutter",
].join(", ");

export function resolvePromptParams(
  params: BackgroundPromptParams,
): Required<BackgroundPromptParams> & { palette: string } {
  const base = THEME_DEFAULTS[params.themeId] ?? THEME_DEFAULTS.dawn!;
  return {
    themeId: params.themeId,
    mood: params.mood ?? base.mood,
    season: params.season ?? base.season,
    timeOfDay: params.timeOfDay ?? base.timeOfDay,
    style: params.style ?? base.style,
    textSafeZone: params.textSafeZone ?? base.textSafeZone,
    palette: base.palette,
  };
}

/** 高质量英文 Prompt，供 SD / Flux / DALL·E 等使用 */
export function buildBackgroundPrompt(params: BackgroundPromptParams): {
  prompt: string;
  negativePrompt: string;
  resolved: ReturnType<typeof resolvePromptParams>;
} {
  const r = resolvePromptParams(params);
  const prompt = [
    "A serene spiritual abstract landscape background for a quiet meditation card,",
    `style: ${STYLE_LABEL[r.style]},`,
    `mood: ${MOOD_LABEL[r.mood]},`,
    `season: ${SEASON_LABEL[r.season]},`,
    `time of day: ${TIME_LABEL[r.timeOfDay]},`,
    `palette: muted ${r.palette},`,
    "soft natural light, gentle atmospheric depth,",
    "classical oil painting texture mixed with modern minimal composition,",
    `ample negative space in the ${r.textSafeZone.replace("_", " ")} for overlaying Chinese typography,`,
    "no people, no faces, no hands, no portraits,",
    "no crosses, no churches, no religious icons, no halos, no angels,",
    "no text, no letters, no logos, no watermark, no brand,",
    "no commercial advertising look, no glossy stock-photo feel,",
    "high detail, calm, reverent, contemplative, 8k quality",
  ].join(" ");

  return {
    prompt,
    negativePrompt: NEGATIVE_PROMPT,
    resolved: r,
  };
}
