/**
 * 安全换行：绘制前必须已设置 ctx.font
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const width = Math.max(40, maxWidth);
  const lines: string[] = [];
  let current = "";

  for (const char of normalized) {
    const trial = current + char;
    const w = ctx.measureText(trial).width;
    // measureText 异常为 0 时仍继续拼整行，避免空数组
    if ((w > 0 && w <= width) || current.length === 0) {
      current = trial;
      continue;
    }
    lines.push(current);
    current = char === " " ? "" : char;
  }
  if (current) lines.push(current);

  // 极端情况：保证至少一行
  return lines.length ? lines : [normalized];
}

export function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string,
  sizeRange: readonly [number, number],
  lineHeight: number,
  maxLines: number,
): { fontSize: number; lines: string[] } {
  const minSize = Math.max(18, sizeRange[0] || 28);
  const maxSize = Math.max(minSize, sizeRange[1] || 48);
  const width = Math.max(40, maxWidth);
  const height = Math.max(40, maxHeight);
  const limit = Math.max(1, maxLines || 12);

  let bestSize = minSize;
  let bestLines: string[] = [];

  // 从大到小试，找到第一个能放下的
  for (let size = maxSize; size >= minSize; size -= 2) {
    ctx.font = `600 ${size}px ${fontFamily}`;
    const lines = wrapText(ctx, text, width);
    const h = lines.length * size * lineHeight;
    if (lines.length <= limit && h <= height) {
      bestSize = size;
      bestLines = lines;
      break;
    }
    // 记录最小字号下的分行，作为兜底
    if (size === minSize || bestLines.length === 0) {
      bestSize = size;
      bestLines = lines;
    }
  }

  if (!bestLines.length) {
    ctx.font = `600 ${minSize}px ${fontFamily}`;
    bestLines = wrapText(ctx, text, width);
    bestSize = minSize;
  }

  return { fontSize: bestSize, lines: bestLines };
}
