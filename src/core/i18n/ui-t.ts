import { loadPreferences } from "../storage";
import type { AppLocale, MessageKey } from "./locales";
import { translate } from "./locales";

/** 非 React 模块用：读当前偏好语言并翻译 */
export function uiLocale(): AppLocale {
  const raw = loadPreferences().appLocale;
  if (raw === "en" || raw === "de" || raw === "fr" || raw === "zh") return raw;
  return "zh";
}

export function uiT(key: MessageKey): string {
  return translate(uiLocale(), key);
}
