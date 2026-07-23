import type { BilingualMode, Verse } from "../types";
import { downloadBlob as downloadBlobCore } from "../image/generator";
import {
  canWebShareFiles,
  detectRuntime,
  isCapacitorNative,
  type SocialTarget,
} from "./platform";
import { uiT } from "../i18n";
import { getBrand } from "../brand";

export function buildShareCaption(
  verse: Verse,
  mode: BilingualMode = "zh-en",
): string {
  const parts: string[] = [];

  if (mode !== "en") {
    parts.push(verse.text);
    parts.push(`— ${verse.reference} (${uiT("share.caption.cuv")})`);
  }

  if (mode !== "zh") {
    if (verse.en?.text) {
      if (parts.length) parts.push("");
      parts.push(verse.en.text);
      const tr =
        verse.en.translation === "web"
          ? "WEB"
          : verse.en.translation === "esv"
            ? "ESV"
            : "EN";
      parts.push(
        `— ${verse.en.reference || verse.referenceEn || ""} (${tr})`,
      );
    } else if (mode === "en") {
      parts.push(verse.text);
      parts.push(`— ${verse.reference} (${uiT("share.caption.noEn")})`);
    }
  }

  parts.push("");
  // 话题标签随主品牌
  parts.push(`#${getBrand().masterBrand}`);
  return parts.join("\n");
}

export { downloadBlobCore as downloadBlob };

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1]! : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("read blob failed"));
    reader.readAsDataURL(blob);
  });
}

/**
 * 系统级分享：尽量带上图片文件
 */
export async function shareViaSystem(options: {
  blob: Blob;
  filename: string;
  caption: string;
}): Promise<"shared" | "downloaded" | "cancelled" | "unsupported"> {
  const { blob, filename, caption } = options;

  const safeName =
    filename.replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_") ||
    `jinju_${Date.now()}.png`;

  const title = getBrand().displayName;
  const dialogTitle = uiT("share.dialogTitle");

  if (await isCapacitorNative()) {
    try {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");
      const base64 = await blobToBase64(blob);
      const path = `jinju-share/${safeName}`;
      try {
        await Filesystem.mkdir({
          path: "jinju-share",
          directory: Directory.Cache,
          recursive: true,
        });
      } catch {
        // exists
      }
      await Filesystem.writeFile({
        path,
        data: base64,
        directory: Directory.Cache,
        recursive: true,
      });
      const { uri } = await Filesystem.getUri({
        directory: Directory.Cache,
        path,
      });
      await Share.share({
        title,
        text: caption,
        url: uri,
        dialogTitle,
      });
      return "shared";
    } catch (err) {
      const msg = String((err as Error)?.message || err);
      if (/cancel|CANCEL|abort|Abort/i.test(msg)) return "cancelled";
      console.warn("[share] capacitor file share failed", err);
      try {
        const { Share } = await import("@capacitor/share");
        await Share.share({
          title,
          text: caption,
          dialogTitle,
        });
        await downloadBlobCore(blob, safeName);
        return "shared";
      } catch (e2) {
        if (/cancel|CANCEL|abort|Abort/i.test(String(e2))) return "cancelled";
      }
    }
  }

  try {
    const file = new File([blob], safeName, {
      type: blob.type || "image/png",
    });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text: caption,
      });
      return "shared";
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return "cancelled";
    console.warn("[share] web files share failed", err);
  }

  try {
    if (navigator.share) {
      await navigator.share({ title, text: caption });
      await downloadBlobCore(blob, filename);
      return "shared";
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return "cancelled";
  }

  return "unsupported";
}

export interface ShareTargetResult {
  ok: boolean;
  action: SocialTarget;
  message: string;
}

/**
 * 针对具体社交目标执行分享策略
 */
export async function shareToTarget(options: {
  target: SocialTarget;
  blob: Blob;
  filename: string;
  verse: Verse;
  mode: BilingualMode;
  dataUrl?: string;
}): Promise<ShareTargetResult> {
  const caption = buildShareCaption(options.verse, options.mode);
  const env = detectRuntime();
  const { target, blob, filename } = options;

  if (target === "system") {
    if (env === "wechat") {
      await downloadBlobCore(blob, filename);
      await copyText(caption);
      return {
        ok: true,
        action: target,
        message: uiT("share.msg.wechatInApp"),
      };
    }
    const r = await shareViaSystem({ blob, filename, caption });
    if (r === "shared") {
      return {
        ok: true,
        action: target,
        message: uiT("share.msg.systemOpened"),
      };
    }
    if (r === "cancelled") {
      return {
        ok: false,
        action: target,
        message: uiT("share.msg.cancelled"),
      };
    }
    await downloadBlobCore(blob, filename);
    await copyText(caption);
    return {
      ok: true,
      action: target,
      message: uiT("share.msg.unsupported"),
    };
  }

  if (target === "save") {
    await downloadBlobCore(blob, filename);
    return {
      ok: true,
      action: target,
      message: uiT("share.msg.saved"),
    };
  }

  if (target === "copy") {
    const ok = await copyText(caption);
    return {
      ok,
      action: target,
      message: ok ? uiT("share.msg.copied") : uiT("share.msg.copyFail"),
    };
  }

  await downloadBlobCore(blob, filename);
  await copyText(caption);

  const guides: Partial<Record<SocialTarget, string>> = {
    wechat: uiT("share.msg.guide.wechat"),
    moments: uiT("share.msg.guide.moments"),
    xiaohongshu: uiT("share.msg.guide.xiaohongshu"),
    instagram: uiT("share.msg.guide.instagram"),
    x: uiT("share.msg.guide.x"),
    facebook: uiT("share.msg.guide.facebook"),
    whatsapp: uiT("share.msg.guide.whatsapp"),
  };

  if (target === "whatsapp" && !/MicroMessenger/i.test(navigator.userAgent)) {
    try {
      const r = await shareViaSystem({ blob, filename, caption });
      if (r === "shared") {
        return {
          ok: true,
          action: target,
          message: uiT("share.msg.pickWhatsapp"),
        };
      }
    } catch {
      // fallthrough
    }
  }

  if (
    (target === "wechat" || target === "moments") &&
    env !== "wechat" &&
    canWebShareFiles()
  ) {
    try {
      const r = await shareViaSystem({ blob, filename, caption });
      if (r === "shared") {
        return {
          ok: true,
          action: target,
          message: uiT("share.msg.pickWechat"),
        };
      }
    } catch {
      // guide below
    }
  }

  return {
    ok: true,
    action: target,
    message: guides[target] || uiT("share.msg.savedCopy"),
  };
}

/** 兼容旧调用 */
export async function shareVerseImage(options: {
  blob: Blob;
  filename: string;
  verse: Verse;
  mode: BilingualMode;
}): Promise<"shared" | "downloaded" | "copied" | "cancelled"> {
  const caption = buildShareCaption(options.verse, options.mode);
  const r = await shareViaSystem({
    blob: options.blob,
    filename: options.filename,
    caption,
  });
  if (r === "shared") return "shared";
  if (r === "cancelled") return "cancelled";
  await downloadBlobCore(options.blob, options.filename);
  await copyText(caption);
  return "downloaded";
}
