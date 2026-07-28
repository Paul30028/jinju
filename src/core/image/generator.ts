import type {
  BilingualMode,
  GeneratedImageMeta,
  ImageSizeName,
  VerseOfDay,
} from "../types";
import { IMAGE_SIZES } from "../types";
import { resolveTemplate, resolveTheme } from "../theme";
import { composeVerseImage } from "./composer";
import { hashDateSeed } from "../hash";
import {
  countThemeImages,
  loadBackgroundCatalog,
  loadThemePhotoStrict,
} from "./remote-background";
import { loadPreferences } from "../storage";
import { ensureEnglish } from "../verse/bilingual";

export interface GenerateOptions {
  verseOfDay: VerseOfDay;
  sizeName?: ImageSizeName;
  themeId?: string;
  templateId?: string;
  bilingualMode?: BilingualMode;
  showBrandWatermark?: boolean;
  /** 覆盖偏好：是否用摄影背景 */
  usePhotoBackground?: boolean;
  /**
   * 同主题换图序号。点「重新生成」时 +1，立即换该主题下另一张贴切图。
   * 0 = 当日默认图。
   */
  bgVariation?: number;
  /** 上一张已展示的主题图 id；重新生成时强制跳过，保证视觉会变 */
  excludeBgItemId?: string;
}

export interface GenerateResult {
  canvas: HTMLCanvasElement;
  blob: Blob;
  dataUrl: string;
  meta: GeneratedImageMeta;
  backgroundKind?: "photo" | "gradient";
  /** primary | backup1 | backup2 | local */
  backgroundTier?: string;
  photoCredit?: string;
  /** 当前主题可用贴切图数量 */
  themePhotoCount?: number;
  bgVariation?: number;
  /** 本次实际使用的主题图条目 id */
  bgItemId?: string;
}

export async function generateVerseImage(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const { verseOfDay } = options;
  if (!verseOfDay?.verse?.text && !verseOfDay?.verse?.en?.text) {
    throw new Error("经文为空，无法生成图片");
  }

  const prefs = loadPreferences();
  const themeId = options.themeId || verseOfDay.themeId || "dawn";
  let templateId = options.templateId || verseOfDay.templateId || "center";
  const sizeName = options.sizeName || "story";
  const size = IMAGE_SIZES[sizeName] ?? IMAGE_SIZES.story;

  let theme = resolveTheme(themeId);
  let template = resolveTemplate(templateId);
  if (template.id !== templateId && templateId !== "center") {
    templateId = "center";
    template = resolveTemplate("center");
  }

  const bilingualMode = options.bilingualMode ?? prefs.bilingualMode ?? "zh-en";
  const wantPhoto =
    options.usePhotoBackground ?? prefs.usePhotoBackground !== false;

  // 仅英文 / 双语：确保有英文（本地 ESV 或在线 WEB 公版）
  let verse = verseOfDay.verse;
  if (bilingualMode === "en" || bilingualMode === "zh-en") {
    try {
      verse = await ensureEnglish(verse, {
        timeoutMs: bilingualMode === "en" ? 6000 : 3500,
        allowNetwork: true,
      });
    } catch {
      // keep original
    }
  }

  let photo: HTMLImageElement | null = null;
  let photoCredit: string | undefined;
  let backgroundKind: "photo" | "gradient" = "gradient";
  let backgroundTier = "local";

  const bgVariation = Math.max(0, options.bgVariation ?? 0);
  let themePhotoCount = 0;
  let bgItemId: string | undefined;

  if (wantPhoto) {
    try {
      const { catalog } = await loadBackgroundCatalog(false);
      themePhotoCount = countThemeImages(catalog, theme.id);
      // 严格主题：只在该主题图池内选；重新生成靠 variation + exclude 换图
      const loaded = await loadThemePhotoStrict({
        catalog,
        themeId: theme.id,
        date: verseOfDay.date || "2026-01-01",
        variation: bgVariation,
        width: size.width,
        height: size.height,
        timeoutMs: 7000,
        ...(options.excludeBgItemId
          ? { excludeItemId: options.excludeBgItemId }
          : {}),
      });
      backgroundTier = loaded.tier;
      themePhotoCount = loaded.poolSize || themePhotoCount;
      if (loaded.img && loaded.itemId) {
        photo = loaded.img;
        photoCredit = loaded.credit || loaded.label;
        backgroundKind = "photo";
        bgItemId = loaded.itemId;
      } else {
        photo = null;
        backgroundKind = "gradient";
        photoCredit = themePhotoCount
          ? "本地渐变（该主题图源暂时不可用）"
          : "本地渐变（该主题暂无贴切摄影）";
      }
    } catch (e) {
      console.warn("[generate] strict theme photo failed", e);
      photo = null;
      backgroundKind = "gradient";
      backgroundTier = "local";
    }
  }

  let composed;
  try {
    composed = await composeVerseImage({
      verse,
      theme,
      template,
      size,
      date: verseOfDay.date || new Date().toISOString().slice(0, 10),
      bilingualMode,
      showBrandWatermark: options.showBrandWatermark !== false,
      photo,
      ...(photoCredit ? { photoCredit } : {}),
    });
  } catch (err) {
    console.warn("[generate] compose failed, retry gradient center", err);
    theme = resolveTheme("dawn");
    template = resolveTemplate("center");
    composed = await composeVerseImage({
      verse,
      theme,
      template,
      size,
      date: verseOfDay.date || new Date().toISOString().slice(0, 10),
      bilingualMode: bilingualMode === "en" ? "en" : "zh",
      showBrandWatermark: true,
      photo: null,
    });
    backgroundKind = "gradient";
  }

  const { canvas, width, height } = composed;
  const blob = await canvasToBlob(canvas);
  const dataUrl = canvas.toDataURL("image/png");

  const meta: GeneratedImageMeta = {
    id: `${verseOfDay.id}_${sizeName}_${template.id}_${hashDateSeed(verseOfDay.date, theme.id)}`,
    verseOfDayId: verseOfDay.id,
    width,
    height,
    templateId: template.id,
    themeId: theme.id,
    createdAt: new Date().toISOString(),
  };

  const result: GenerateResult = {
    canvas,
    blob,
    dataUrl,
    meta,
    backgroundKind,
    backgroundTier,
    themePhotoCount,
    bgVariation,
  };
  if (photoCredit) result.photoCredit = photoCredit;
  if (bgItemId) result.bgItemId = bgItemId;
  return result;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const finishFromDataUrl = () => {
      try {
        const dataUrl = canvas.toDataURL("image/png");
        if (!dataUrl || dataUrl.length < 100) {
          reject(new Error("画布导出为空（可能被跨域图片污染）"));
          return;
        }
        const bin = atob(dataUrl.split(",")[1] || "");
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        resolve(new Blob([arr], { type: "image/png" }));
      } catch (e) {
        reject(
          e instanceof Error
            ? e
            : new Error("导出 PNG 失败，请改用本地主题色背景后再试"),
        );
      }
    };

    try {
      canvas.toBlob((b) => {
        if (!b || b.size < 64) {
          finishFromDataUrl();
          return;
        }
        resolve(b);
      }, "image/png");
    } catch {
      finishFromDataUrl();
    }
  });
}

export { downloadBlob } from "./download";
import { downloadBlob as downloadBlobImpl } from "./download";

export async function shareImage(options: {
  blob: Blob;
  title: string;
  text: string;
  filename: string;
}): Promise<"shared" | "downloaded" | "unsupported"> {
  const safeName = options.filename.replace(/[^\w.\-]+/g, "_") || "jinju.png";
  const file = new File([options.blob], safeName, {
    type: options.blob.type || "image/png",
  });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: options.title,
        text: options.text,
      });
      return "shared";
    }
  } catch {
    // fallthrough
  }
  await downloadBlobImpl(options.blob, safeName);
  return "downloaded";
}
