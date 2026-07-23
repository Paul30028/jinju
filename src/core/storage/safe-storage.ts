/**
 * localStorage 安全读写：配额满时自动瘦身 / 清理大图字段
 */

const LEGACY_PREVIEW_KEYS = [
  "jinju-ri:history:v1",
  "jinju-ri:collection:v1",
];

/** 启动时清理已膨胀的预览图字段（base64 PNG 易超 5MB 配额） */
export function migrateStripHeavyPreviews(): void {
  for (const key of LEGACY_PREVIEW_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      // 超过 ~400KB 的条目几乎一定含 data URL
      if (raw.length < 200_000 && !raw.includes("data:image")) continue;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) continue;
      const slim = parsed.map((item) => stripPreview(item));
      localStorage.setItem(key, JSON.stringify(slim));
    } catch {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  }
}

function stripPreview(item: unknown): unknown {
  if (!item || typeof item !== "object") return item;
  const copy = { ...(item as Record<string, unknown>) };
  delete copy.previewDataUrl;
  return copy;
}

export function safeSetJson(key: string, value: unknown): void {
  const payload = JSON.stringify(value);
  try {
    localStorage.setItem(key, payload);
    return;
  } catch {
    // 配额：先去掉预览字段再试
  }

  try {
    const slim =
      Array.isArray(value)
        ? value.map((v) => stripPreview(v))
        : stripPreview(value);
    localStorage.setItem(key, JSON.stringify(slim));
    return;
  } catch {
    // still failing
  }

  // 最后手段：清相关键后只写精简数据
  try {
    for (const k of LEGACY_PREVIEW_KEYS) {
      if (k !== key) localStorage.removeItem(k);
    }
    const slim = Array.isArray(value)
      ? value.map((v) => stripPreview(v)).slice(0, 20)
      : stripPreview(value);
    localStorage.setItem(key, JSON.stringify(slim));
  } catch (err) {
    console.warn("[jinju-ri] localStorage quota exceeded", err);
  }
}

export function safeGetJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
