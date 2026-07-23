import { loadPreferences } from "../storage/preferences";
import type { ColorSchemePref } from "../types";

/** 应用浅/深/跟随系统到 <html data-theme> */
export function applyColorScheme(pref: ColorSchemePref): void {
  const root = document.documentElement;
  if (pref === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", pref);
  }
  syncThemeColorMeta(pref);
}

export function resolveIsDark(pref: ColorSchemePref): boolean {
  if (pref === "dark") return true;
  if (pref === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function syncThemeColorMeta(pref: ColorSchemePref): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute("content", resolveIsDark(pref) ? "#121416" : "#F7F5F2");
}

/** 启动时读取偏好并监听系统主题变化 */
export function initColorScheme(): () => void {
  const applyFromPrefs = () => {
    const pref = loadPreferences().colorScheme ?? "system";
    applyColorScheme(pref);
  };
  applyFromPrefs();

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    const pref = loadPreferences().colorScheme ?? "system";
    if (pref === "system") applyColorScheme("system");
  };
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
