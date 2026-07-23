/**
 * 日级调度工具
 * - 本地：getTodayKey 作为「今日」边界
 * - 后期：Supabase Cron 调用 Edge Function 预生成
 */

export function getTodayKey(timeZone = "Asia/Shanghai"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

/** 距离用户时区次日 0 点的毫秒数（可用于本地刷新定时） */
export function msUntilNextLocalMidnight(timeZone = "Asia/Shanghai"): number {
  const today = getTodayKey(timeZone);
  // approximate: check every minute by polling tomorrow key
  const now = Date.now();
  // 15 minutes max poll interval fallback — compute via iterative hour steps
  for (let i = 1; i <= 48; i++) {
    const future = new Date(now + i * 30 * 60 * 1000);
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(future);
    if (key !== today) {
      return i * 30 * 60 * 1000;
    }
  }
  return 60 * 60 * 1000;
}
