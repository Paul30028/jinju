/**
 * 可靠的图片保存：Web 下载 + Capacitor 写入公共目录
 * 解决：WebView 禁用 a.download、中文文件名、URL 过早 revoke
 */
import { isCapacitorNative } from "../share/platform";

function safeFilename(name: string): string {
  const base = name
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .trim();
  // 部分 WebView 对中文 download 名不友好，保留扩展名，正文用拼音前缀
  if (/[^\x00-\x7F]/.test(base)) {
    const ext = base.match(/\.[a-zA-Z0-9]+$/)?.[0] || ".png";
    const stamp = Date.now().toString(36);
    return `jinju-ri_${stamp}${ext}`;
  }
  return base || `jinju-ri_${Date.now()}.png`;
}

export async function ensurePngBlob(blob: Blob | null | undefined): Promise<Blob> {
  if (blob && blob.size > 0) {
    if (blob.type === "image/png" || blob.type === "image/jpeg") return blob;
    // re-type if needed
    return new Blob([await blob.arrayBuffer()], { type: "image/png" });
  }
  throw new Error("图片数据为空，请重新生成后再保存");
}

/** 主入口：尽量保存到本机相册/下载目录 */
export async function downloadBlob(
  blob: Blob,
  filename: string,
): Promise<"native" | "web" | "open"> {
  const file = safeFilename(filename);
  const png = await ensurePngBlob(blob);

  // Capacitor Android / iOS
  if (await isCapacitorNative()) {
    try {
      await saveViaCapacitor(png, file);
      return "native";
    } catch (e) {
      console.warn("[download] capacitor failed", e);
      // fall through to web
    }
  }

  // Web / PWA：a[download]
  try {
    await saveViaAnchor(png, file);
    return "web";
  } catch (e) {
    console.warn("[download] anchor failed", e);
  }

  // 最后：新窗口打开，用户可长按保存
  const url = URL.createObjectURL(png);
  const w = window.open(url, "_blank");
  if (!w) {
    // 弹窗被拦：尝试 location 导航（同页）
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return "open";
}

async function saveViaCapacitor(blob: Blob, filename: string): Promise<void> {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const base64 = await blobToBase64(blob);
  const path = `jinju-ri/${filename}`;

  // 优先外部存储 Documents（用户可在文件管理器找到）
  try {
    await Filesystem.mkdir({
      path: "jinju-ri",
      directory: Directory.Documents,
      recursive: true,
    });
  } catch {
    // exists
  }

  await Filesystem.writeFile({
    path,
    data: base64,
    directory: Directory.Documents,
    recursive: true,
  });

  // 尝试分享到系统「保存到相册」类目标（部分机型）
  try {
    const { Share } = await import("@capacitor/share");
    const { uri } = await Filesystem.getUri({
      directory: Directory.Documents,
      path,
    });
    // 不自动弹分享；仅确保文件已落盘
    void uri;
    void Share;
  } catch {
    // ignore
  }
}

async function saveViaAnchor(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    // 同步 click，部分 Safari 需要在用户手势栈内
    a.click();
    a.remove();
    // 延迟 revoke，避免 Chrome/WebView 还没开始下载就失效
    await new Promise((r) => setTimeout(r, 1500));
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1]! : result;
      if (!base64) reject(new Error("base64 empty"));
      else resolve(base64);
    };
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}
