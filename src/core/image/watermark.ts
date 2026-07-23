import type { Theme } from "../types";
import { getBrand } from "../brand";

/** 免费版品牌水印（随区域：静澄 / Serein） */
export function drawBrandWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: Theme,
): void {
  const brand = getBrand();
  // 成图水印用短名，避免中英叠字过长
  const text = brand.shortName;
  const size = Math.max(14, Math.round(width * 0.018));
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.font = `500 ${size}px "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif`;
  ctx.fillStyle = theme.colors.meta || "#666666";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(
    text,
    width - Math.round(width * 0.04),
    height - Math.round(height * 0.028),
  );
  ctx.restore();
}
