import type { Theme } from "../types";

export interface BackgroundPaintInput {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  theme: Theme;
  seed: number;
}

/**
 * 多色层次背景（参考主流圣经 App 金句海报气质）
 * 纯本地 Canvas，非 AI、非单色平涂
 */
export function paintBackground(input: BackgroundPaintInput): void {
  const { ctx, width, height, theme, seed } = input;
  const rand = mulberry32(seed);
  const palette = resolvePalette(theme.id);

  // 1. 多色主渐变（对角线 + 第二层交叉）
  paintMultiGradient(ctx, width, height, palette, rand);

  // 2. 大气色块（柔和有机形状）
  paintColorBlobs(ctx, width, height, palette, rand);

  // 3. 光带 / 晨昏线
  paintLightBands(ctx, width, height, palette, rand);

  // 4. 装饰几何（细弧、角饰感）
  paintGeometry(ctx, width, height, palette, rand);

  // 5. 细颗粒质感
  const darkTheme = theme.id === "night" || theme.id === "sanctuary";
  paintGrain(ctx, width, height, rand, darkTheme ? 0.055 : 0.04);

  // 6. 可读性暗角 / 轻 vignette（不抹成单色）
  paintVignette(ctx, width, height, darkTheme);
}

interface Palette {
  stops: string[];
  accents: string[];
  glow: string;
  deep: string;
}

function resolvePalette(themeId: string): Palette {
  switch (themeId) {
    case "night":
      return {
        stops: ["#0b1220", "#1a2744", "#2a1f4a", "#0f1a2e"],
        accents: ["#c9a86c", "#6b8cae", "#8b6bb0", "#3d5a80"],
        glow: "rgba(201, 168, 108, 0.22)",
        deep: "rgba(5, 10, 22, 0.45)",
      };
    case "wilderness":
      return {
        stops: ["#f3e6cf", "#e2c49a", "#c4a06a", "#8f7a55"],
        accents: ["#d4a574", "#a67c52", "#e8d5b0", "#6b5344"],
        glow: "rgba(255, 230, 180, 0.35)",
        deep: "rgba(80, 55, 30, 0.18)",
      };
    case "mist":
      return {
        stops: ["#eef5f7", "#cfe0e6", "#a8c5c8", "#7fa3a8"],
        accents: ["#8eb8b4", "#d4e8e4", "#5a8a8e", "#b8d4d0"],
        glow: "rgba(255, 255, 255, 0.4)",
        deep: "rgba(40, 70, 80, 0.14)",
      };
    case "parchment":
      return {
        stops: ["#faf3e4", "#edd9b0", "#d4b483", "#b8956a"],
        accents: ["#c4a06a", "#8b6914", "#f0e0c0", "#a67c4a"],
        glow: "rgba(255, 245, 220, 0.4)",
        deep: "rgba(90, 60, 30, 0.16)",
      };
    case "sanctuary":
      return {
        stops: ["#14101f", "#2a2148", "#3d2d5c", "#1a1530"],
        accents: ["#c9a86c", "#8b6bb0", "#5a4a80", "#e0c48a"],
        glow: "rgba(201, 168, 108, 0.2)",
        deep: "rgba(10, 6, 20, 0.45)",
      };
    case "olive":
      return {
        stops: ["#f2f6ec", "#d5e2c4", "#a8c090", "#6a8a58"],
        accents: ["#8aab6a", "#c8dcb0", "#5a7a48", "#e0ecd0"],
        glow: "rgba(255, 255, 255, 0.38)",
        deep: "rgba(40, 60, 30, 0.14)",
      };
    case "river":
      return {
        stops: ["#eef6fa", "#c0dce8", "#7ab0c8", "#4a88a8"],
        accents: ["#6ab0c8", "#d0e8f0", "#3a7898", "#a8d0e0"],
        glow: "rgba(255, 255, 255, 0.4)",
        deep: "rgba(20, 50, 70, 0.16)",
      };
    case "dawn":
    default:
      return {
        stops: ["#fff6eb", "#f0d5b8", "#e8b4a0", "#b8c9b0", "#8aafc4"],
        accents: ["#e8a87c", "#c9d5c0", "#f5d0c0", "#7a9eb5", "#d4a574"],
        glow: "rgba(255, 255, 255, 0.45)",
        deep: "rgba(60, 50, 40, 0.12)",
      };
  }
}

function paintMultiGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rand: () => number,
): void {
  // base diagonal
  const g1 = ctx.createLinearGradient(0, 0, w * (0.6 + rand() * 0.4), h);
  const n = p.stops.length;
  p.stops.forEach((c, i) => {
    g1.addColorStop(i / Math.max(1, n - 1), c);
  });
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, w, h);

  // secondary cross wash
  const g2 = ctx.createLinearGradient(w, 0, 0, h * 0.8);
  g2.addColorStop(0, "rgba(255,255,255,0)");
  g2.addColorStop(0.45, p.glow);
  g2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, w, h);
}

function paintColorBlobs(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rand: () => number,
): void {
  const count = 5 + Math.floor(rand() * 3);
  for (let i = 0; i < count; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const r = (0.18 + rand() * 0.35) * Math.min(w, h);
    const color = p.accents[Math.floor(rand() * p.accents.length)] ?? p.accents[0]!;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const alpha = 0.18 + rand() * 0.22;
    g.addColorStop(0, hexToRgba(color, alpha));
    g.addColorStop(0.55, hexToRgba(color, alpha * 0.35));
    g.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintLightBands(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rand: () => number,
): void {
  // soft horizon band
  const y = h * (0.4 + rand() * 0.25);
  const band = ctx.createLinearGradient(0, y - h * 0.12, 0, y + h * 0.18);
  band.addColorStop(0, "rgba(255,255,255,0)");
  band.addColorStop(0.5, p.glow);
  band.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = band;
  ctx.fillRect(0, y - h * 0.12, w, h * 0.3);

  // diagonal light streak
  ctx.save();
  ctx.translate(w * 0.5, h * 0.3);
  ctx.rotate((-18 + rand() * 12) * (Math.PI / 180));
  const streak = ctx.createLinearGradient(-w, 0, w, 0);
  streak.addColorStop(0, "rgba(255,255,255,0)");
  streak.addColorStop(0.5, "rgba(255,255,255,0.12)");
  streak.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = streak;
  ctx.fillRect(-w, -h * 0.04, w * 2, h * 0.08);
  ctx.restore();
}

function paintGeometry(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rand: () => number,
): void {
  const accent = p.accents[0] ?? "#c9a86c";

  // corner arcs (poster-like ornament)
  ctx.save();
  ctx.strokeStyle = hexToRgba(accent, 0.28);
  ctx.lineWidth = Math.max(1.5, w * 0.003);
  const m = w * 0.06;
  // top-left
  ctx.beginPath();
  ctx.arc(m * 2, m * 2, m * 1.6, Math.PI, Math.PI * 1.5);
  ctx.stroke();
  // bottom-right
  ctx.beginPath();
  ctx.arc(w - m * 2, h - m * 2, m * 1.6, 0, Math.PI * 0.5);
  ctx.stroke();
  ctx.restore();

  // thin frame inset
  ctx.save();
  ctx.strokeStyle = hexToRgba(accent, 0.18);
  ctx.lineWidth = 1;
  const inset = w * 0.04;
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  ctx.restore();

  // floating small circles (subtle)
  for (let i = 0; i < 8; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 2 + rand() * 6;
    ctx.fillStyle = hexToRgba(accent, 0.12 + rand() * 0.12);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rand: () => number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = rand() > 0.5 ? "#000" : "#fff";
    ctx.fillRect(rand() * w, rand() * h, 1.2, 1.2);
  }
  ctx.restore();
}

function paintVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  night: boolean,
): void {
  const g = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.2,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.75,
  );
  if (night) {
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.42)");
  } else {
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.7, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(40, 35, 30, 0.2)");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return `rgba(200,180,140,${a})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function mulberry32(a: number): () => number {
  return function next() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
