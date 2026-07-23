/**
 * IndexedDB 图片缓存（idb-keyval）
 * 今日成图 / 历史缩略图，不占 localStorage 配额
 */
import { del, get, set } from "idb-keyval";

const IMG = (id: string) => `jinju-ri:img:v1:${id}`;
const THUMB = (id: string) => `jinju-ri:thumb:v1:${id}`;

/** 写入原图 + JPEG 缩略图 */
export async function putGeneratedImage(
  id: string,
  blob: Blob,
): Promise<void> {
  if (!id || !blob?.size) return;
  await set(IMG(id), blob);
  try {
    const thumb = await blobToThumb(blob, 280);
    await set(THUMB(id), thumb);
  } catch {
    // 缩略失败不阻断
  }
}

export async function getGeneratedBlob(id: string): Promise<Blob | null> {
  try {
    const b = await get<Blob>(IMG(id));
    return b ?? null;
  } catch {
    return null;
  }
}

export async function getThumbBlob(id: string): Promise<Blob | null> {
  try {
    const t = await get<Blob>(THUMB(id));
    if (t) return t;
    return getGeneratedBlob(id);
  } catch {
    return null;
  }
}

/** 创建 object URL，调用方负责 revoke */
export async function getThumbObjectUrl(id: string): Promise<string | null> {
  const blob = await getThumbBlob(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function getImageObjectUrl(id: string): Promise<string | null> {
  const blob = await getGeneratedBlob(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function removeGeneratedImage(id: string): Promise<void> {
  try {
    await del(IMG(id));
    await del(THUMB(id));
  } catch {
    // ignore
  }
}

async function blobToThumb(blob: Blob, maxEdge: number): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d");
    ctx.drawImage(bitmap, 0, 0, w, h);
    const out = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("thumb encode failed"))),
        "image/jpeg",
        0.82,
      );
    });
    return out;
  } finally {
    bitmap.close();
  }
}
