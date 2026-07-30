/**
 * 图片网关契约。
 *
 * 生产环境由网关聚合 Pixabay / Pexels / Unsplash，并只返回已通过
 * 版权、内容和 Canvas 导出校验的素材。未配置网关时调用方可以继续
 * 使用兼容降级，保证现有安装不被阻断。
 */
export interface GatewayBackgroundItem {
  id: string;
  imageUrl: string;
  provider: "pixabay" | "pexels" | "unsplash" | string;
  attribution: string;
  sourceUrl?: string;
  license?: string;
  /** 网关只应返回允许写入 Canvas 并导出 PNG 的图片。 */
  exportAllowed: boolean;
}

interface GatewayResponse {
  items?: GatewayBackgroundItem[];
}

export interface GatewaySelectionInput {
  assetId: string;
  date: string;
  themeId: string;
}

const REQUEST_TIMEOUT_MS = 3_500;
const INSTALLATION_ID_KEY = "serein:image-gateway:installation-id:v1";

export function getImageGatewayUrl(): string {
  return ((import.meta.env.VITE_IMAGE_GATEWAY_URL as string | undefined) || "")
    .trim()
    .replace(/\/$/, "");
}

/**
 * 读取由服务端审核过的同主题摄影图。
 *
 * 网关不可用时返回空数组，让上层切换到兼容提供方、内置图库或渐变；
 * 不将网络故障升级为整个出图流程的失败。
 */
export async function loadGatewayBackgrounds(
  themeId: string,
  page: number,
  limit = 18,
): Promise<GatewayBackgroundItem[]> {
  const baseUrl = getImageGatewayUrl();
  if (!baseUrl || !themeId) return [];

  let url: URL;
  try {
    url = new URL(`${baseUrl}/v1/backgrounds`);
  } catch {
    return [];
  }
  url.searchParams.set("theme", themeId);
  url.searchParams.set("page", String(Math.max(0, page)));
  url.searchParams.set("limit", String(Math.max(1, Math.min(limit, 30))));
  url.searchParams.set("orientation", "portrait");

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as GatewayResponse;
    return (payload.items || []).filter(isUsableGatewayItem);
  } catch {
    return [];
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * 仅在图片实际加载并用于出图后记录每日选择。
 *
 * 安装标识只保留在本机；M1 服务会先散列它再持久化，避免记录原始标识。
 * 记录失败不影响图片加载或导出。
 */
export async function recordGatewayBackgroundSelection(
  input: GatewaySelectionInput,
): Promise<void> {
  const baseUrl = getImageGatewayUrl();
  if (
    !baseUrl ||
    !input.assetId ||
    !input.themeId ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date)
  ) {
    return;
  }

  let url: string;
  try {
    url = new URL("/v1/backgrounds/selection", `${baseUrl}/`).toString();
  } catch {
    return;
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assetId: input.assetId,
        date: input.date,
        theme: input.themeId,
        installationId: getGatewayInstallationId(),
      }),
    });
  } catch {
    // 观测回写是尽力而为，不能阻断用户生成卡片。
  } finally {
    window.clearTimeout(timer);
  }
}

export function getGatewayInstallationId(): string {
  try {
    const existing = localStorage.getItem(INSTALLATION_ID_KEY);
    if (existing) return existing;
    const next =
      typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : `install-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(INSTALLATION_ID_KEY, next);
    return next;
  } catch {
    return "ephemeral-installation";
  }
}

function isUsableGatewayItem(item: GatewayBackgroundItem): boolean {
  return Boolean(
    item &&
      item.id &&
      item.imageUrl &&
      item.provider &&
      item.attribution &&
      item.exportAllowed,
  );
}
