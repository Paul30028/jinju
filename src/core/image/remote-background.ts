import localCatalog from "../../data/background-catalog.json";
import { hashDateSeed } from "../hash";

/**
 * 图片源策略（防脱源 + 严格主题）
 * ─────────────────────────────────────
 * 图文件加载顺序（同一主题条目）：
 *   1. 主源 primary   （如 Unsplash，主题贴切图）
 *   2. 备源1 backup1  （weserv 代理「同一张」URL，不换内容）
 *   3. 同主题下一张条目（仍贴切，不跨主题）
 *   4. 本地 local     （当前主题色渐变，永不依赖外网）
 *
 * 禁止：Lorem Picsum 等随机图（会严重跑题）
 *
 * 目录 JSON 加载顺序：
 *   1. VITE_BG_CATALOG_URL
 *   2. VITE_BG_CATALOG_URL_BACKUP
 *   3. localStorage 缓存（版本不低于打包时）
 *   4. 打包内 background-catalog.json
 */

export interface BgCatalogItem {
  id: string;
  themes: string[];
  tags?: string[];
  /** 主源 URL */
  url: string;
  /** 备源1 URL（可选，无则自动生成 weserv 代理） */
  urlBackup?: string;
  /** 备源2 URL（可选，无则自动生成 picsum） */
  urlBackup2?: string;
  credit?: string;
}

export interface BgCatalog {
  version: number;
  updatedAt?: string;
  sourceNote?: string;
  items: BgCatalogItem[];
}

export type ImageSourceTier = "primary" | "backup1" | "backup2" | "local";

export interface ResolvedImageSource {
  tier: ImageSourceTier;
  label: string;
  url: string | null;
  credit?: string;
}

export interface LoadPhotoResult {
  img: HTMLImageElement | null;
  tier: ImageSourceTier;
  label: string;
  credit?: string;
  tried: { tier: string; url: string; ok: boolean; error?: string }[];
}

const CATALOG_CACHE_KEY = "jinju-ri:bg-catalog:v2";
const CATALOG_META_KEY = "jinju-ri:bg-catalog-meta:v2";
const IMAGE_CACHE_PREFIX = "jinju-ri:bg-img:v2:";

/**
 * 已知含人物正面/人像特写/举手人群的 Unsplash photo id（硬拦截）
 * 标签过滤不够：很多条目 tags 写的是 church/bible，实际图是人
 */
const BLOCKED_UNSPLASH_PHOTO_IDS = new Set([
  // 举手人群 / 崇拜会场（用户在 localhost 看到的那张）
  "1507692049790-de58290a4334",
  // 手持圣经（可辨认人手）
  "1504052434569-70ad5836ab65",
  // 书桌前人物
  "14565130808-af00444e4d1c",
  // 打开圣经 + 人手常见构图
  "1505664194779-8beaceb93744",
  "1519791883288-dc8bd696e667",
  // 其它易含人像的历史条目
  "1529070538774-1843cb3265df",
]);

/** 从 Unsplash URL 提取 photo-xxxx 段 */
export function extractUnsplashPhotoId(url: string): string | null {
  const m = url.match(/photo-([a-zA-Z0-9-]+)/i);
  return m?.[1] ? m[1] : null;
}

export function isBlockedPortraitUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const id = extractUnsplashPhotoId(url);
  if (!id) return false;
  if (BLOCKED_UNSPLASH_PHOTO_IDS.has(id)) return true;
  // Unsplash id 形如 1507692049790-de58290a4334；也按数字前缀拦截
  for (const blocked of BLOCKED_UNSPLASH_PHOTO_IDS) {
    const num = blocked.split("-")[0];
    if (num && id.startsWith(num)) return true;
  }
  return false;
}

export function getCatalogUrl(): string {
  const env = import.meta.env.VITE_BG_CATALOG_URL as string | undefined;
  return env?.trim() || "";
}

export function getCatalogBackupUrl(): string {
  const env = import.meta.env.VITE_BG_CATALOG_URL_BACKUP as string | undefined;
  return env?.trim() || "";
}

export function getDefaultCatalog(): BgCatalog {
  return normalizeCatalog(localCatalog as BgCatalog);
}

export interface CatalogMeta {
  source: "remote" | "remote-backup" | "local" | "cache";
  fetchedAt?: string;
  version?: number;
  url?: string;
  itemCount: number;
}

/** 规范化目录：补全双备份 URL，并剔除人物肖像条目 */
export function normalizeCatalog(raw: BgCatalog): BgCatalog {
  const items = (raw.items || [])
    .map((item) => normalizeItem(item))
    .filter((item) => !isPortraitBlockedItem(item));
  return { ...raw, items };
}

export function isPortraitBlockedItem(item: BgCatalogItem): boolean {
  if (hasBlockedPortraitTags(item.tags)) return true;
  if (isBlockedPortraitUrl(item.url)) return true;
  if (item.urlBackup && isBlockedPortraitUrl(item.urlBackup)) return true;
  if (item.urlBackup2 && isBlockedPortraitUrl(item.urlBackup2)) return true;
  return false;
}

export function normalizeItem(item: BgCatalogItem): BgCatalogItem {
  const primary = item.url;
  const backup1 =
    item.urlBackup ||
    (primary ? buildWeservProxy(primary, 1080, 1920) : undefined);
  // 仅保留目录显式提供的备源2；绝不自动填 Picsum（随机图会跑题）
  const backup2 = item.urlBackup2;

  const next: BgCatalogItem = {
    id: item.id,
    // 无 themes 视为无效条目，后续严格筛选会丢弃（不用 "*" 全库兜底）
    themes: Array.isArray(item.themes) ? item.themes.filter(Boolean) : [],
    url: primary,
  };
  if (item.tags) next.tags = item.tags;
  if (item.credit) next.credit = item.credit;
  if (backup1) next.urlBackup = backup1;
  if (backup2) next.urlBackup2 = backup2;
  return next;
}

/** Unsplash → weserv 代理（备源1，防主 CDN 不可达） */
export function buildWeservProxy(
  originalUrl: string,
  w: number,
  h: number,
): string {
  try {
    // weserv 要去掉 https://
    const stripped = originalUrl.replace(/^https?:\/\//i, "");
    const u = new URL("https://images.weserv.nl/");
    u.searchParams.set("url", stripped);
    u.searchParams.set("w", String(w));
    u.searchParams.set("h", String(h));
    u.searchParams.set("fit", "cover");
    u.searchParams.set("we", "");
    u.searchParams.set("output", "jpg");
    return u.toString();
  } catch {
    return originalUrl;
  }
}

export function buildPicsumUrl(seedKey: string, w: number, h: number): string {
  const seed = Math.abs(hashString(seedKey)) % 1_000_000_000;
  return `https://picsum.photos/seed/jinju${seed}/${w}/${h}`;
}

export interface ResolveSourcesOptions {
  /**
   * true（默认用于严格主题）：只加载「同一张主题图」的主源 + 代理，
   * 不使用随机/异图备源2。
   */
  samePhotoOnly?: boolean;
}

/**
 * 解析单条目的在线源（不含本地渐变）
 */
export function resolveOnlineSources(
  item: BgCatalogItem,
  width = 1080,
  height = 1920,
  options: ResolveSourcesOptions = {},
): ResolvedImageSource[] {
  const samePhotoOnly = options.samePhotoOnly !== false;
  const n = normalizeItem(item);
  const primary = withSizeParams(n.url, width, height);
  const backup1 = withSizeParams(
    n.urlBackup || buildWeservProxy(n.url, width, height),
    width,
    height,
  );

  const list: ResolvedImageSource[] = [
    {
      tier: "primary",
      label: "主源",
      url: primary,
      credit: n.credit || "Primary CDN",
    },
    {
      tier: "backup1",
      label: "备源1",
      url: backup1,
      credit: n.credit || "Backup CDN",
    },
  ];

  // 仅当目录显式配置了「同主题」备源2，且未要求 samePhotoOnly 限制时才用
  // Picsum 随机种子 URL 一律拒绝
  if (!samePhotoOnly && n.urlBackup2 && !isRandomPlaceholderUrl(n.urlBackup2)) {
    list.push({
      tier: "backup2",
      label: "备源2",
      url: withSizeParams(n.urlBackup2, width, height),
      credit: n.credit || "Backup CDN 2",
    });
  }

  return list;
}

/** 随机图占位（禁止用于主题背景） */
export function isRandomPlaceholderUrl(url: string): boolean {
  return /picsum\.photos|placeholder\.com|lorempixel|lorem\.space/i.test(url);
}

/**
 * 目录加载：主远程 → 备远程 → 缓存 → 本地打包
 */
export async function loadBackgroundCatalog(
  forceRefresh = false,
): Promise<{ catalog: BgCatalog; meta: CatalogMeta }> {
  const primaryUrl = getCatalogUrl();
  const backupUrl = getCatalogBackupUrl();

  if (!forceRefresh) {
    const cached = readCachedCatalog();
    const local = getDefaultCatalog();
    // 打包目录版本更新时优先用新本地目录，避免旧缓存含人物肖像图
    if (cached && (cached.version ?? 0) >= (local.version ?? 0)) {
      // 即使版本够新，也再 scrub 一次（拦截历史脏条目）
      const scrubbed = normalizeCatalog(cached);
      if (scrubbed.items.length !== (cached.items?.length ?? 0)) {
        writeCachedCatalog(scrubbed);
      }
      return {
        catalog: scrubbed,
        meta: {
          source: "cache",
          itemCount: scrubbed.items.length,
          version: scrubbed.version,
          ...readCachedMeta(),
        },
      };
    }
  }

  // 主目录 URL
  if (primaryUrl) {
    const got = await tryFetchCatalog(primaryUrl, "remote", forceRefresh);
    if (got) return got;
  }

  // 备份目录 URL
  if (backupUrl) {
    const got = await tryFetchCatalog(backupUrl, "remote-backup", forceRefresh);
    if (got) return got;
  }

  // 强制刷新失败时仍可回退缓存
  if (forceRefresh) {
    const cached = readCachedCatalog();
    if (cached) {
      return {
        catalog: cached,
        meta: {
          source: "cache",
          itemCount: cached.items.length,
          version: cached.version,
        },
      };
    }
  }

  const local = getDefaultCatalog();
  return {
    catalog: local,
    meta: {
      source: "local",
      version: local.version,
      itemCount: local.items.length,
    },
  };
}

async function tryFetchCatalog(
  url: string,
  source: "remote" | "remote-backup",
  forceRefresh: boolean,
): Promise<{ catalog: BgCatalog; meta: CatalogMeta } | null> {
  try {
    const res = await fetch(url, {
      cache: forceRefresh ? "no-store" : "default",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = normalizeCatalog((await res.json()) as BgCatalog);
    if (!data.items.length) throw new Error("empty");
    writeCachedCatalog(data);
    const meta: CatalogMeta = {
      source,
      fetchedAt: new Date().toISOString(),
      version: data.version,
      url,
      itemCount: data.items.length,
    };
    writeCachedMeta(meta);
    return { catalog: data, meta };
  } catch (e) {
    console.warn(`[bg-catalog] ${source} failed`, url, e);
    return null;
  }
}

/**
 * 禁止人物正面肖像 / 人像特写（网络图库安全策略）
 * 命中标签则丢弃该条目
 */
const PORTRAIT_TAG_BLOCK =
  /portrait|selfie|face|faces|person|people|human|crowd|hands|hand|model|worshipper|audience|silhouette-people/i;

export function hasBlockedPortraitTags(tags?: string[]): boolean {
  if (!tags?.length) return false;
  return tags.some((t) => PORTRAIT_TAG_BLOCK.test(String(t).trim()));
}

/**
 * 严格按主题筛选图片（禁止串主题）
 * - themes 必须明确包含 themeId
 * - 丢弃空 themes / 含 "*" 的通配条目
 * - 丢弃人物肖像（标签 + URL 黑名单）
 * - 不用全库兜底，避免「书卷出现风景」等错配
 */
export function filterItemsByThemeStrict(
  catalog: BgCatalog,
  themeId: string,
): BgCatalogItem[] {
  if (!themeId) return [];
  const items = catalog.items.length
    ? catalog.items
    : getDefaultCatalog().items;
  return items
    .filter((i) => {
      if (!Array.isArray(i.themes) || !i.themes.length) return false;
      if (i.themes.includes("*")) return false;
      if (!i.url || isRandomPlaceholderUrl(i.url)) return false;
      if (isPortraitBlockedItem(i)) return false;
      // 必须明确挂到当前主题；允许单主题或多标签中含本主题
      return i.themes.includes(themeId);
    })
    .map(normalizeItem)
    .filter(
      (i) =>
        i.themes.includes(themeId) &&
        !!i.url &&
        !isPortraitBlockedItem(i),
    );
}

/**
 * 计算同主题池内目标下标：今日稳定 + variation 步进
 * 若指定 excludeItemId 且池子>1，保证不与上一张相同（重新生成必换图）
 */
export function resolveThemePoolIndex(
  pool: BgCatalogItem[],
  date: string,
  themeId: string,
  variation: number,
  excludeItemId?: string,
): number {
  if (!pool.length) return 0;
  const base = hashDateSeed(date, `bg-strict-${themeId}`);
  let idx = (base + Math.max(0, variation)) % pool.length;
  if (excludeItemId && pool.length > 1 && pool[idx]?.id === excludeItemId) {
    idx = (idx + 1) % pool.length;
  }
  return idx;
}

/**
 * @returns 选中的条目；若主题下无任何图则 null（上层用本地渐变）
 */
export function pickBackgroundItem(
  catalog: BgCatalog,
  date: string,
  themeId: string,
  variation = 0,
  excludeItemId?: string,
): BgCatalogItem | null {
  const pool = filterItemsByThemeStrict(catalog, themeId);
  if (!pool.length) {
    console.warn(`[bg] 主题「${themeId}」无贴切图片，使用本地渐变`);
    return null;
  }
  const idx = resolveThemePoolIndex(
    pool,
    date,
    themeId,
    variation,
    excludeItemId,
  );
  return pool[idx]!;
}

/** 同主题内换一张（跳过当前 id，供即时换图） */
export function pickNextThemeItem(
  catalog: BgCatalog,
  themeId: string,
  date: string,
  variation: number,
  excludeId?: string,
): BgCatalogItem | null {
  return pickBackgroundItem(catalog, date, themeId, variation, excludeId);
}

export function countThemeImages(
  catalog: BgCatalog,
  themeId: string,
): number {
  return filterItemsByThemeStrict(catalog, themeId).length;
}

/**
 * 主源 → 备源1（同图代理）依次加载；全部失败返回 local
 * 严格主题模式：不使用随机图，不会换成其它主题的图
 */
export async function loadPhotoWithFallback(
  item: BgCatalogItem,
  width: number,
  height: number,
  timeoutMs = 8000,
  options: ResolveSourcesOptions = { samePhotoOnly: true },
): Promise<LoadPhotoResult> {
  const sources = resolveOnlineSources(item, width, height, options);
  const tried: LoadPhotoResult["tried"] = [];

  for (const src of sources) {
    if (!src.url || isRandomPlaceholderUrl(src.url)) {
      if (src.url) {
        tried.push({
          tier: src.tier,
          url: src.url,
          ok: false,
          error: "random placeholder blocked",
        });
      }
      continue;
    }
    if (isBlockedPortraitUrl(src.url)) {
      tried.push({
        tier: src.tier,
        url: src.url,
        ok: false,
        error: "portrait photo blocked",
      });
      continue;
    }
    try {
      const img = await loadBackgroundImage(src.url, timeoutMs);
      if (img.naturalWidth > 0) {
        tried.push({ tier: src.tier, url: src.url, ok: true });
        const out: LoadPhotoResult = {
          img,
          tier: src.tier,
          label: src.label,
          tried,
        };
        const credit = item.credit || src.credit;
        if (credit) out.credit = credit;
        return out;
      }
      tried.push({
        tier: src.tier,
        url: src.url,
        ok: false,
        error: "empty image",
      });
    } catch (e) {
      tried.push({
        tier: src.tier,
        url: src.url,
        ok: false,
        error: e instanceof Error ? e.message : "load failed",
      });
    }
  }

  return {
    img: null,
    tier: "local",
    label: "本地渐变",
    credit: "Local",
    tried,
  };
}

/**
 * 严格主题加载：
 * - 只从当前主题图池取图
 * - variation + exclude 保证「重新生成」立刻换另一张同主题图
 * - 当前条目 CDN 失败时，仅在同主题池内级联，绝不跨主题
 * - 绝不使用 Picsum 等随机图
 */
export async function loadThemePhotoStrict(options: {
  catalog: BgCatalog;
  themeId: string;
  date: string;
  variation: number;
  width: number;
  height: number;
  timeoutMs?: number;
  /** 上一张已展示的条目 id；重新生成时强制跳过 */
  excludeItemId?: string;
}): Promise<LoadPhotoResult & { itemId?: string; poolSize: number }> {
  const pool = filterItemsByThemeStrict(options.catalog, options.themeId);
  if (!pool.length) {
    return {
      img: null,
      tier: "local",
      label: "本地渐变",
      credit: "Local",
      tried: [],
      poolSize: 0,
    };
  }

  let start = resolveThemePoolIndex(
    pool,
    options.date,
    options.themeId,
    options.variation,
    options.excludeItemId,
  );

  const allTried: LoadPhotoResult["tried"] = [];
  // 最多试完本主题全部条目；每条目只用同图主源+代理
  for (let step = 0; step < pool.length; step++) {
    const item = pool[(start + step) % pool.length]!;
    // 第一步已按 exclude 跳过；后续若仍命中 exclude（池=1）可接受
    if (
      step > 0 &&
      options.excludeItemId &&
      pool.length > 1 &&
      item.id === options.excludeItemId
    ) {
      continue;
    }
    const loaded = await loadPhotoWithFallback(
      item,
      options.width,
      options.height,
      options.timeoutMs ?? 7000,
      { samePhotoOnly: true },
    );
    allTried.push(...loaded.tried);
    if (loaded.img) {
      return {
        ...loaded,
        itemId: item.id,
        tried: allTried,
        poolSize: pool.length,
      };
    }
  }

  return {
    img: null,
    tier: "local",
    label: "本地渐变",
    credit: "Local",
    tried: allTried,
    poolSize: pool.length,
  };
}

const memoryImageCache = new Map<string, HTMLImageElement>();

export async function loadBackgroundImage(
  url: string,
  timeoutMs = 10000,
): Promise<HTMLImageElement> {
  const hit = memoryImageCache.get(url);
  if (hit?.complete && hit.naturalWidth > 0) return hit;

  try {
    const cachedBlob = await readImageCache(url);
    if (cachedBlob) {
      const img = await blobToImage(cachedBlob);
      memoryImageCache.set(url, img);
      return img;
    }
  } catch {
    // ignore
  }

  const img = await fetchImage(url, timeoutMs);
  memoryImageCache.set(url, img);

  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      await writeImageCache(url, blob);
    }
  } catch {
    // ignore
  }

  return img;
}

function fetchImage(url: string, timeoutMs: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = window.setTimeout(() => {
      reject(new Error("timeout"));
    }, timeoutMs);
    img.onload = () => {
      window.clearTimeout(timer);
      if (img.naturalWidth < 1) reject(new Error("invalid dimensions"));
      else resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("onerror"));
    };
    img.src = url;
  });
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("blob decode failed"));
    };
    img.src = url;
  });
}

async function readImageCache(url: string): Promise<Blob | null> {
  if (!("caches" in window)) return null;
  const cache = await caches.open("jinju-bg-v2");
  const res = await cache.match(IMAGE_CACHE_PREFIX + encodeURIComponent(url));
  if (!res) return null;
  return res.blob();
}

async function writeImageCache(url: string, blob: Blob): Promise<void> {
  if (!("caches" in window)) return;
  const cache = await caches.open("jinju-bg-v2");
  await cache.put(
    IMAGE_CACHE_PREFIX + encodeURIComponent(url),
    new Response(blob, {
      headers: { "Content-Type": blob.type || "image/jpeg" },
    }),
  );
}

function readCachedCatalog(): BgCatalog | null {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    return normalizeCatalog(JSON.parse(raw) as BgCatalog);
  } catch {
    return null;
  }
}

function writeCachedCatalog(data: BgCatalog): void {
  try {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(data));
  } catch {
    // quota
  }
}

function readCachedMeta(): Partial<CatalogMeta> {
  try {
    const raw = localStorage.getItem(CATALOG_META_KEY);
    return raw ? (JSON.parse(raw) as CatalogMeta) : {};
  } catch {
    return {};
  }
}

function writeCachedMeta(meta: CatalogMeta): void {
  try {
    localStorage.setItem(CATALOG_META_KEY, JSON.stringify(meta));
  } catch {
    // ignore
  }
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
): void {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(width / iw, height / ih);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
}

export function drawPhotoReadabilityOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  night: boolean,
): void {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  if (night) {
    g.addColorStop(0, "rgba(0,0,0,0.35)");
    g.addColorStop(0.35, "rgba(0,0,0,0.25)");
    g.addColorStop(0.65, "rgba(0,0,0,0.4)");
    g.addColorStop(1, "rgba(0,0,0,0.55)");
  } else {
    g.addColorStop(0, "rgba(20,18,14,0.28)");
    g.addColorStop(0.4, "rgba(20,18,14,0.22)");
    g.addColorStop(0.7, "rgba(20,18,14,0.38)");
    g.addColorStop(1, "rgba(20,18,14,0.5)");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  const vig = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.15,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
}

export function withSizeParams(url: string, w: number, h: number): string {
  try {
    if (url.includes("images.unsplash.com")) {
      const u = new URL(url);
      u.searchParams.set("w", String(Math.min(w, 1600)));
      u.searchParams.set("h", String(Math.min(h, 2400)));
      u.searchParams.set("fit", "crop");
      u.searchParams.set("auto", "format");
      u.searchParams.set("q", "80");
      return u.toString();
    }
    if (url.includes("images.weserv.nl")) {
      const u = new URL(url);
      u.searchParams.set("w", String(w));
      u.searchParams.set("h", String(h));
      u.searchParams.set("fit", "cover");
      return u.toString();
    }
    if (url.includes("picsum.photos")) {
      return url.replace(/\/\d+\/\d+(\?|$)/, `/${w}/${h}$1`);
    }
  } catch {
    // keep
  }
  return url;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}
