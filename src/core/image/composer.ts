import type {
  BilingualMode,
  ImageSize,
  LayoutTemplate,
  Theme,
  Verse,
} from "../types";
import { paintBackground } from "./background";
import {
  drawImageCover,
  drawPhotoReadabilityOverlay,
} from "./remote-background";
import { fitFontSize, wrapText } from "./wrap-text";
import { hashDateSeed } from "../hash";
import { uiT } from "../i18n";
import { drawBrandWatermark } from "./watermark";
import { getVerseTranslationLabel } from "../verse/translation-label";

export interface ComposeInput {
  verse: Verse;
  theme: Theme;
  template: LayoutTemplate;
  size: ImageSize;
  date: string;
  bilingualMode?: BilingualMode;
  showBrandWatermark?: boolean;
  /** 免费摄影图背景（已加载）；无则用程序多色渐变 */
  photo?: HTMLImageElement | null;
  photoCredit?: string;
}

export interface ComposeResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

const FONT_ZH = '"Noto Serif SC", "Source Han Serif SC", STSong, SimSun, serif';
const FONT_EN = '"Source Serif 4", Georgia, "Times New Roman", serif';
const FONT_META = '"Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const LH_ZH = 1.58;
const LH_EN = 1.48;

/**
 * 金句海报合成 — 国际潮流（留白 · 经文后紧跟出处 · 轻装饰）
 * 本地 Canvas 叠字，非 AI
 */
export async function composeVerseImage(
  input: ComposeInput,
): Promise<ComposeResult> {
  await waitFonts();

  const width = input.size?.width || 1080;
  const height = input.size?.height || 1920;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建画布");

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  clearShadow(ctx);

  const seed = hashDateSeed(input.date || "2026-01-01", input.theme?.id || "dawn");
  const usePhoto = Boolean(input.photo && input.photo.naturalWidth > 0);

  if (usePhoto && input.photo) {
    drawImageCover(ctx, input.photo, width, height);
    drawPhotoReadabilityOverlay(ctx, width, height, input.theme?.id === "night");
  } else {
    paintBackground({ ctx, width, height, theme: input.theme, seed });
  }
  ctx.globalAlpha = 1;
  clearShadow(ctx);

  const mode = input.bilingualMode ?? "zh-en";
  const zhText = mode === "en" ? "" : (input.verse.text || "").trim();
  // 英文：只用 en 字段，绝不把中文当英文显示
  let enText = mode === "zh" ? "" : (input.verse.en?.text || "").trim();
  if (mode === "en" && !enText) {
    // 无英文时给出明确提示，避免「看起来没转换」
    enText =
      input.verse.referenceEn
        ? `(${input.verse.referenceEn})\nEnglish text is loading or unavailable offline.`
        : "English text unavailable for this verse.";
  }

  // 摄影背景上强制浅色字；程序背景按主题
  const isDark =
    usePhoto ||
    input.theme?.id === "night" ||
    input.theme?.id === "sanctuary";
  const zhColor = isDark ? "#f7f2ea" : "#1c221e";
  const enColor = isDark ? "#e0d8cc" : "#4a534c";
  const metaColor = isDark ? "#ddd5c8" : "#5a625c";
  const accent = input.theme.colors.accent || (isDark ? "#e0c48a" : "#a67c52");

  const layout = input.template?.layout || "center";
  const margin = Math.round(Math.min(width, height) * 0.07);

  // 国际潮流：轻边框、留白、少装饰
  drawMinimalFrame(ctx, width, height, margin * 0.55, accent, isDark);
  drawTopKicker(ctx, width, margin, accent, isDark);

  const content = layoutBox(layout, width, height, margin);
  if (layout === "bottom" || layout === "left-right") {
    drawSoftPanel(ctx, content, isDark);
  }
  if (layout === "left-rail") {
    drawAccentRail(ctx, content.x - margin * 0.35, content.y, content.h * 0.55, accent);
  }
  if (layout === "center-quote") {
    drawQuoteMarks(ctx, content, accent, width);
  }

  // 经文 + 出处紧随其后（不放底部）
  drawVerseBlock(ctx, {
    zh: zhText || (enText ? "" : "（经文）"),
    en: enText,
    box: content,
    zhColor,
    enColor,
    accent,
    metaColor,
    verse: input.verse,
    mode,
    date: input.date || "",
  });

  if (input.showBrandWatermark !== false) {
    drawBrandWatermark(ctx, width, height, {
      ...input.theme,
      colors: { ...input.theme.colors, meta: metaColor },
    });
  }

  // 不在画面上绘制 Photo / Unsplash 等英文署名（用户要求取消）

  return { canvas, width, height };
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  align: "left" | "center";
}

function layoutBox(
  layout: string,
  width: number,
  height: number,
  margin: number,
): Box {
  const top = margin * 1.8;
  const bottom = height - margin * 2.2;
  const fullH = bottom - top;
  const fullW = width - margin * 2;

  switch (layout) {
    case "top-bottom":
      return { x: margin, y: top + fullH * 0.05, w: fullW, h: fullH * 0.5, align: "left" };
    case "bottom":
      return {
        x: margin * 1.1,
        y: top + fullH * 0.42,
        w: fullW - margin * 0.2,
        h: fullH * 0.48,
        align: "left",
      };
    case "left-right":
      return {
        x: width * 0.42,
        y: top + fullH * 0.12,
        w: width * 0.48,
        h: fullH * 0.65,
        align: "left",
      };
    case "left-rail":
      return {
        x: margin * 1.5,
        y: top + fullH * 0.14,
        w: fullW - margin * 0.6,
        h: fullH * 0.62,
        align: "left",
      };
    case "center-quote":
      return {
        x: margin * 1.15,
        y: top + fullH * 0.14,
        w: fullW - margin * 0.3,
        h: fullH * 0.58,
        align: "center",
      };
    default:
      return {
        x: margin,
        y: top + fullH * 0.12,
        w: fullW,
        h: fullH * 0.58,
        align: "center",
      };
  }
}

/** 极简国际海报框：细线 + 轻圆角感（用直角细框，避免喧宾夺主） */
function drawMinimalFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  m: number,
  accent: string,
  isDark: boolean,
): void {
  ctx.save();
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(m * 0.45, m * 0.45, w - m * 0.9, h - m * 0.9);

  ctx.strokeStyle = hexAlpha(accent, isDark ? 0.22 : 0.18);
  ctx.lineWidth = Math.max(1, w * 0.0018);
  ctx.strokeRect(m, m, w - m * 2, h - m * 2);
  ctx.restore();
}

function drawTopKicker(
  ctx: CanvasRenderingContext2D,
  width: number,
  margin: number,
  accent: string,
  isDark: boolean,
): void {
  const label = uiT("image.kicker");
  const size = Math.max(13, Math.round(width * 0.016));
  ctx.save();
  ctx.font = `500 ${size}px ${FONT_META}`;
  ctx.fillStyle = hexAlpha(accent, isDark ? 0.85 : 0.75);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, width / 2, margin * 1.15);

  // small divider under kicker
  const midY = margin * 1.15 + size + 10;
  ctx.strokeStyle = hexAlpha(accent, 0.4);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - width * 0.08, midY);
  ctx.lineTo(width / 2 + width * 0.08, midY);
  ctx.stroke();
  ctx.restore();
}

function drawSoftPanel(
  ctx: CanvasRenderingContext2D,
  box: Box,
  isDark: boolean,
): void {
  ctx.save();
  ctx.globalAlpha = isDark ? 0.38 : 0.34;
  ctx.fillStyle = isDark ? "#0a0e14" : "#ffffff";
  roundRect(ctx, box.x - 16, box.y - 18, box.w + 32, box.h + 36, 18);
  ctx.fill();
  // glass edge
  ctx.globalAlpha = isDark ? 0.2 : 0.35;
  ctx.strokeStyle = isDark ? "#ffffff" : "#ffffff";
  ctx.lineWidth = 1;
  roundRect(ctx, box.x - 16, box.y - 18, box.w + 32, box.h + 36, 18);
  ctx.stroke();
  ctx.restore();
}

function drawAccentRail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  accent: string,
): void {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, hexAlpha(accent, 0.15));
  g.addColorStop(0.5, hexAlpha(accent, 0.85));
  g.addColorStop(1, hexAlpha(accent, 0.15));
  ctx.fillStyle = g;
  roundRect(ctx, x, y, 7, h, 4);
  ctx.fill();
  ctx.restore();
}

function drawQuoteMarks(
  ctx: CanvasRenderingContext2D,
  box: Box,
  accent: string,
  width: number,
): void {
  ctx.save();
  ctx.fillStyle = hexAlpha(accent, 0.35);
  ctx.font = `700 ${Math.round(width * 0.09)}px ${FONT_ZH}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("「", box.x - 8, box.y - 20);
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("」", box.x + box.w + 8, box.y + box.h + 10);
  ctx.restore();
}

/**
 * 国际潮流排版（YouVersion / Glorify 气质）：
 * 经文 → 细分割线 → 出处（紧随经文，不贴底） → 译本小字
 */
function drawVerseBlock(
  ctx: CanvasRenderingContext2D,
  opts: {
    zh: string;
    en: string;
    box: Box;
    zhColor: string;
    enColor: string;
    accent: string;
    metaColor: string;
    verse: Verse;
    mode: BilingualMode;
    date: string;
  },
): void {
  const { box, zhColor, enColor, accent, metaColor } = opts;
  let zh = opts.zh;
  const en = opts.en;
  if (!zh && !en) zh = "（无经文）";

  const hasBoth = Boolean(zh && en);
  // 预留出处区高度
  const refReserve = Math.round(box.h * 0.14);
  const bodyBudget = box.h - refReserve;
  const zhBudget = hasBoth ? bodyBudget * 0.52 : bodyBudget * 0.72;
  const enBudget = hasBoth ? bodyBudget * 0.28 : bodyBudget * 0.72;

  ctx.save();
  ctx.globalAlpha = 1;
  clearShadow(ctx);
  ctx.textBaseline = "top";
  ctx.textAlign = box.align;
  const x = box.align === "center" ? box.x + box.w / 2 : box.x;
  let y = box.y;

  if (zh) {
    const maxFs = Math.min(58, Math.round(box.w / 11.5));
    const fit = fitFontSize(
      ctx,
      zh,
      box.w,
      zhBudget,
      FONT_ZH,
      [24, maxFs],
      LH_ZH,
      12,
    );
    const fontSize = Math.max(22, fit.fontSize);
    const lines = fit.lines.length
      ? fit.lines
      : wrapText(setFont(ctx, fontSize), zh, box.w);

    ctx.font = `500 ${fontSize}px ${FONT_ZH}`;
    ctx.fillStyle = zhColor;
    ctx.strokeStyle =
      zhColor.startsWith("#f") || zhColor.startsWith("#F")
        ? "rgba(0,0,0,0.35)"
        : "rgba(255,255,255,0.45)";
    ctx.lineWidth = Math.max(1.5, fontSize * 0.045);
    ctx.lineJoin = "round";

    for (const line of lines) {
      ctx.strokeText(line, x, y);
      ctx.fillText(line, x, y);
      y += fontSize * LH_ZH;
    }
    y += fontSize * 0.22;

    if (en) {
      drawHairline(ctx, box, x, y, accent);
      y += fontSize * 0.32;
    }
  }

  if (en) {
    let best = 17;
    let lines = [en];
    for (let s = 28; s >= 14; s -= 1) {
      ctx.font = `400 ${s}px ${FONT_EN}`;
      const ls = wrapText(ctx, en, box.w);
      if (ls.length * s * LH_EN <= enBudget && ls.length <= 8) {
        best = s;
        lines = ls;
        break;
      }
      best = s;
      lines = ls;
    }
    ctx.font = `italic 400 ${best}px ${FONT_EN}`;
    ctx.fillStyle = enColor;
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    for (const line of lines) {
      ctx.strokeText(line, x, y);
      ctx.fillText(line, x, y);
      y += best * LH_EN;
    }
  }

  // —— 出处：紧接经文之后 ——
  y += Math.max(18, box.w * 0.028);
  drawHairline(ctx, box, x, y, accent);
  y += Math.max(16, box.w * 0.022);

  const { main, sub } = formatReference(opts.verse, opts.mode);
  const refSize = Math.max(15, Math.round(box.w * 0.032));
  ctx.font = `500 ${refSize}px ${FONT_META}`;
  ctx.fillStyle = metaColor;
  ctx.globalAlpha = 0.92;
  ctx.fillText(main, x, y);
  y += refSize * 1.45;

  if (sub) {
    ctx.font = `400 ${Math.max(12, refSize - 3)}px ${FONT_META}`;
    ctx.globalAlpha = 0.72;
    // 字距感：用细空格分隔译本与日期
    const metaLine = opts.date ? `${sub}  ·  ${opts.date}` : sub;
    ctx.fillText(metaLine, x, y);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function formatReference(
  verse: Verse,
  mode: BilingualMode,
): { main: string; sub: string } {
  const zhRef = (verse.reference || "").trim();
  const enRef = (verse.en?.reference || verse.referenceEn || "").trim();
  const label = getVerseTranslationLabel(verse, mode);
  if (mode === "en") {
    return { main: enRef || zhRef, sub: label };
  }
  if (mode === "zh-en" && enRef && zhRef) {
    return { main: zhRef, sub: `${enRef}  ·  ${label}` };
  }
  if (mode === "zh-en" && zhRef) {
    return { main: zhRef, sub: label };
  }
  return { main: zhRef || enRef, sub: label || "CUV" };
}

function drawHairline(
  ctx: CanvasRenderingContext2D,
  box: Box,
  x: number,
  y: number,
  accent: string,
): void {
  ctx.save();
  ctx.strokeStyle = hexAlpha(accent, 0.45);
  ctx.lineWidth = 1;
  const dw = Math.min(box.w * 0.14, 64);
  ctx.beginPath();
  if (box.align === "center") {
    ctx.moveTo(x - dw / 2, y);
    ctx.lineTo(x + dw / 2, y);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + dw, y);
  }
  ctx.stroke();
  ctx.restore();
}

function setFont(ctx: CanvasRenderingContext2D, size: number): CanvasRenderingContext2D {
  ctx.font = `600 ${size}px ${FONT_ZH}`;
  return ctx;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function hexAlpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return `rgba(166,124,82,${a})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

async function waitFonts(): Promise<void> {
  if (!("fonts" in document)) return;
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`600 42px ${FONT_ZH}`),
        document.fonts.load(`400 20px ${FONT_EN}`),
        document.fonts.ready,
      ]),
      new Promise<void>((r) => setTimeout(r, 500)),
    ]);
  } catch {
    // ignore
  }
}
