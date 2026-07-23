import { useEffect, useState } from "react";
import { applyColorScheme, listFreeTemplates, listThemes } from "@/core/theme";
import { loadPreferences, savePreferences } from "@/core/storage";
import {
  getCatalogBackupUrl,
  getCatalogUrl,
  loadBackgroundCatalog,
  type CatalogMeta,
} from "@/core/image";
import type {
  AppLocalePref,
  BilingualMode,
  ColorSchemePref,
  ImageSizeName,
  UserPreferences,
} from "@/core/types";
import { useI18n } from "@/core/i18n";
import { getBrand } from "@/core/brand";

export default function SettingsPage() {
  const { t, locale, setLocale, locales, themeName, templateName } = useI18n();
  const brand = getBrand();
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadPreferences());
  const [saved, setSaved] = useState(false);
  const [catalogMeta, setCatalogMeta] = useState<CatalogMeta | null>(null);
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [catalogMsg, setCatalogMsg] = useState("");

  const themes = listThemes();
  const templates = listFreeTemplates();
  const remoteUrl = getCatalogUrl();
  const remoteBackupUrl = getCatalogBackupUrl();

  useEffect(() => {
    void loadBackgroundCatalog(false).then(({ meta }) => setCatalogMeta(meta));
  }, []);

  // 语言切换后从 storage 整份重读，避免草稿覆盖 bilingualMode
  useEffect(() => {
    setPrefs(loadPreferences());
  }, [locale]);

  const patch = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    if (key === "appLocale") {
      // 立即切换界面语言（含成图语言联动），不需点保存
      setLocale(value as AppLocalePref);
      setSaved(false);
      return;
    }
    setPrefs((p) => {
      const next = { ...p, [key]: value };
      // 其它项即时写入，切换页也不丢
      savePreferences(next);
      return next;
    });
    setSaved(false);
    if (key === "colorScheme") {
      applyColorScheme(value as ColorSchemePref);
    }
    if (key === "bilingualMode") {
      // 成图语言单独改时不覆盖 appLocale
    }
  };

  const onSave = () => {
    // 合并最新 storage，防止草稿把 setLocale 写好的 bilingualMode 盖掉
    const latest = loadPreferences();
    const merged: UserPreferences = {
      ...latest,
      ...prefs,
      appLocale: locale,
      bilingualMode: prefs.bilingualMode ?? latest.bilingualMode,
    };
    savePreferences(merged);
    applyColorScheme(merged.colorScheme ?? "system");
    setPrefs(merged);
    setSaved(true);
  };

  const onRefreshCatalog = async () => {
    setCatalogBusy(true);
    setCatalogMsg(t("settings.library.refreshing"));
    try {
      // 清掉旧图库缓存，强制用打包内 v8+（无人物肖像）
      try {
        localStorage.removeItem("jinju-ri:bg-catalog:v2");
        localStorage.removeItem("jinju-ri:bg-catalog-meta:v2");
      } catch {
        // ignore
      }
      const { catalog, meta } = await loadBackgroundCatalog(true);
      setCatalogMeta(meta);
      setCatalogMsg(
        `${t("settings.library.current")} · v${meta.version ?? "-"} · ${catalog.items.length} · ${meta.source}`,
      );
    } catch (e) {
      setCatalogMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setCatalogBusy(false);
    }
  };

  return (
    <section className="card" aria-labelledby="settings-title">
      <span className="badge">{t("settings.badge")}</span>
      <h2 id="settings-title">{t("settings.title")}</h2>
      <p className="muted">{t("settings.intro")}</p>

      <div className="settings-grid">
        <label className="field">
          <span>{t("settings.appearance")}</span>
          <select
            value={prefs.colorScheme ?? "system"}
            onChange={(e) =>
              patch("colorScheme", e.target.value as ColorSchemePref)
            }
          >
            <option value="system">{t("settings.appearance.system")}</option>
            <option value="light">{t("settings.appearance.light")}</option>
            <option value="dark">{t("settings.appearance.dark")}</option>
          </select>
        </label>

        <label className="field">
          <span>{t("settings.appLanguage")}</span>
          <select
            value={locale}
            onChange={(e) =>
              patch("appLocale", e.target.value as AppLocalePref)
            }
          >
            {locales.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.native}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t("settings.verseLanguage")}</span>
          <select
            value={prefs.bilingualMode ?? "zh-en"}
            onChange={(e) =>
              patch("bilingualMode", e.target.value as BilingualMode)
            }
          >
            <option value="zh-en">{t("settings.verse.zhEn")}</option>
            <option value="zh">{t("settings.verse.zh")}</option>
            <option value="en">{t("settings.verse.en")}</option>
          </select>
        </label>

        <label className="field">
          <span>{t("settings.defaultTheme")}</span>
          <select
            value={prefs.themeId}
            onChange={(e) => patch("themeId", e.target.value)}
          >
            {themes.map((th) => (
              <option key={th.id} value={th.id}>
                {themeName(th.id)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t("settings.defaultLayout")}</span>
          <select
            value={prefs.defaultTemplateId}
            onChange={(e) => patch("defaultTemplateId", e.target.value)}
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {templateName(tpl.id)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t("settings.defaultSize")}</span>
          <select
            value={prefs.defaultSize}
            onChange={(e) =>
              patch("defaultSize", e.target.value as ImageSizeName)
            }
          >
            <option value="story">{t("settings.size.story")}</option>
            <option value="square">{t("settings.size.square")}</option>
            <option value="landscape">{t("settings.size.landscape")}</option>
          </select>
        </label>

        <label className="field checkbox">
          <input
            type="checkbox"
            checked={prefs.autoDailyLayout !== false}
            onChange={(e) => patch("autoDailyLayout", e.target.checked)}
          />
          <span>{t("settings.autoLayout")}</span>
        </label>

        <label className="field checkbox">
          <input
            type="checkbox"
            checked={prefs.usePhotoBackground !== false}
            onChange={(e) => patch("usePhotoBackground", e.target.checked)}
          />
          <span>{t("settings.usePhoto")}</span>
        </label>
      </div>

      <div className="prompt-box">
        <h3 className="prompt-title">{t("settings.library")}</h3>
        <p className="muted small">{t("settings.library.hint")}</p>
        <p className="muted small">
          {t("settings.library.current")}：{" "}
          {catalogMeta
            ? `v${catalogMeta.version ?? "-"} · ${catalogMeta.itemCount} · ${catalogMeta.source}`
            : "…"}
        </p>
        {remoteUrl ? <p className="muted small">remote ✓</p> : null}
        {remoteBackupUrl ? <p className="muted small">backup ✓</p> : null}
        <div className="actions" style={{ marginTop: "0.6rem" }}>
          <button
            type="button"
            className="btn ghost"
            disabled={catalogBusy}
            onClick={() => void onRefreshCatalog()}
          >
            {catalogBusy
              ? t("settings.library.refreshing")
              : t("settings.library.refresh")}
          </button>
        </div>
        {catalogMsg ? <p className="status-line">{catalogMsg}</p> : null}
      </div>

      <div className="actions" style={{ marginTop: "1rem" }}>
        <button type="button" className="btn primary" onClick={onSave}>
          {t("settings.save")}
        </button>
      </div>
      {saved ? (
        <p className="status-line ok">{t("settings.saved")}</p>
      ) : null}

      <div className="prompt-box">
        <h3 className="prompt-title">{t("settings.about")}</h3>
        <p className="muted small" style={{ marginTop: 0 }}>
          {brand.displayName}
          {" · "}
          {brand.region === "cn" ? "China" : "International"}
          {" · "}
          {brand.masterBrand}
        </p>
        <ul className="checklist">
          <li>{t("settings.about.1")}</li>
          <li>{t("settings.about.2")}</li>
          <li>{t("settings.about.3")}</li>
          <li>{brand.storeBlurb[locale] || brand.storeBlurb.en}</li>
        </ul>
      </div>
    </section>
  );
}
