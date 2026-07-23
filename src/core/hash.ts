/** 稳定哈希：同一输入永远同一结果（用于每日选题/版式） */
export function hashDateSeed(date: string, salt = "jinju-ri-v1"): number {
  const input = `${salt}:${date}`;
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
