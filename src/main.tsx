import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { getBrand } from "./core/brand";
import { I18nProvider } from "./core/i18n";
import { loadPreferences, migrateStripHeavyPreviews } from "./core/storage";
import "./styles/global.css";

// 清理历史里过大的 base64 预览，避免配额错误（失败不阻断启动）
try {
  migrateStripHeavyPreviews();
} catch (e) {
  console.warn("migrate storage skipped", e);
}

const brand = getBrand();

// 启动时同步 document 与品牌
try {
  const loc = loadPreferences().appLocale || brand.defaultLocale;
  document.documentElement.lang =
    loc === "zh" ? "zh-CN" : loc === "de" ? "de" : loc === "fr" ? "fr" : "en";
  document.title = brand.displayName;
  const icon = document.querySelector('link[rel="icon"]');
  if (icon) icon.setAttribute("href", brand.favicon);
  document.documentElement.dataset.region = brand.region;
} catch {
  // ignore
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
