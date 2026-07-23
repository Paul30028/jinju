import { useCallback, useEffect, useRef, useState } from "react";
import { downloadBlob, generateVerseImage, type GenerateResult } from "@/core/image";
import { listFreeTemplates, listThemes, resolveTemplate } from "@/core/theme";
import {
  isCollected,
  loadPreferences,
  putGeneratedImage,
  toggleCollection,
  updatePreferences,
  upsertHistory,
} from "@/core/storage";
import { ensureEnglish, hasEnglish } from "@/core/verse";
import type { BilingualMode, ImageSizeName, Verse, VerseOfDay } from "@/core/types";
import ShareSheet from "@/components/ShareSheet";
import { useI18n } from "@/core/i18n";

export interface VerseStudioProps {
  verseOfDay: VerseOfDay;
  saveHistory?: boolean;
  showFavorite?: boolean;
  initialSize?: ImageSizeName;
  initialThemeId?: string;
  initialTemplateId?: string;
  dailyAutoNote?: string;
  /** hero：今日单焦点；full：完整编辑面板默认展开 */
  variant?: "hero" | "full";
}

function safeTemplateId(id: string | undefined): string {
  if (!id) return "center";
  const t = resolveTemplate(id);
  return t.id === id ? id : "center";
}

export default function VerseStudio({
  verseOfDay,
  saveHistory = true,
  showFavorite = true,
  initialSize = "story",
  initialThemeId,
  initialTemplateId,
  dailyAutoNote,
  variant = "full",
}: VerseStudioProps) {
  const { t, locale, themeName, templateName } = useI18n();
  const prefs = loadPreferences();
  const [themeId, setThemeId] = useState(
    initialThemeId || verseOfDay.themeId || "dawn",
  );
  const [templateId, setTemplateId] = useState(
    safeTemplateId(initialTemplateId || verseOfDay.templateId),
  );
  const [sizeName, setSizeName] = useState<ImageSizeName>(
    initialSize || "story",
  );
  const [bilingualMode, setBilingualMode] = useState<BilingualMode>(
    prefs.bilingualMode || "zh-en",
  );
  const [bgVariation, setBgVariation] = useState(0);
  const [status, setStatus] = useState(() => t("studio.ready"));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(variant === "full");
  const [displayVerse, setDisplayVerse] = useState<Verse>(verseOfDay.verse);
  const [collected, setCollected] = useState(() =>
    isCollected(verseOfDay.verse.id),
  );
  const genSeq = useRef(0);
  const manualRegen = useRef(false);
  const lastBgItemId = useRef<string | undefined>(undefined);
  /** 结构化状态：切语言时只重写文案，不重新成图 */
  const statusMeta = useRef<{
    kind:
      | "ready"
      | "generating"
      | "generatingEn"
      | "swapping"
      | "done"
      | "doneSwap"
      | "doneGradient"
      | "enNeedNet"
      | "fail"
      | "saving"
      | "savedNative"
      | "savedWeb"
      | "savedLongpress"
      | "saveFail"
      | "favAdded"
      | "favRemoved"
      | "raw";
    themeId?: string;
    mode?: BilingualMode;
    extra?: string;
  }>({ kind: "ready" });

  const tRef = useRef(t);
  const themeNameRef = useRef(themeName);
  tRef.current = t;
  themeNameRef.current = themeName;

  const formatStatus = useCallback(
    (meta: typeof statusMeta.current): string => {
      const tr = tRef.current;
      const th = meta.themeId
        ? themeNameRef.current(meta.themeId)
        : "";
      const modeLabel =
        meta.mode === "en"
          ? tr("studio.en")
          : meta.mode === "zh-en"
            ? tr("studio.zhEn")
            : meta.mode === "zh"
              ? tr("studio.zh")
              : "";
      switch (meta.kind) {
        case "ready":
          return tr("studio.ready");
        case "generating":
          return tr("studio.generating");
        case "generatingEn":
          return tr("studio.generatingEn");
        case "swapping":
          return th
            ? `${tr("studio.swappingTheme")} · ${th}`
            : tr("studio.swappingTheme");
        case "done":
          return `${tr("studio.done")} · ${th}${modeLabel ? ` · ${modeLabel}` : ""}`;
        case "doneSwap":
          return `${tr("studio.doneSwap")} · ${th}`;
        case "doneGradient":
          return `${tr("studio.done")} · ${th} · ${tr("studio.doneGradient")}${modeLabel ? ` · ${modeLabel}` : ""}`;
        case "enNeedNet":
          return `${tr("studio.done")} · ${th} · ${tr("studio.enNeedNet")}`;
        case "fail":
          return meta.extra
            ? `${tr("studio.fail")}: ${meta.extra}`
            : tr("studio.fail");
        case "saving":
          return tr("studio.saving");
        case "savedNative":
          return tr("studio.savedNative");
        case "savedWeb":
          return tr("studio.savedWeb");
        case "savedLongpress":
          return tr("studio.savedLongpress");
        case "saveFail":
          return meta.extra
            ? `${tr("studio.saveFail")}: ${meta.extra}`
            : tr("studio.saveFail");
        case "favAdded":
          return tr("studio.favAdded");
        case "favRemoved":
          return tr("studio.favRemoved");
        case "raw":
          return meta.extra || "";
        default:
          return tr("studio.ready");
      }
    },
    [],
  );

  const pushStatus = useCallback(
    (meta: typeof statusMeta.current) => {
      statusMeta.current = meta;
      setStatus(formatStatus(meta));
    },
    [formatStatus],
  );

  // 切换软件语言时刷新状态行（不重新生成图片）
  useEffect(() => {
    setStatus(formatStatus(statusMeta.current));
  }, [locale, formatStatus]);

  // 软件语言切换后，跟随偏好里的成图语言
  useEffect(() => {
    const mode = loadPreferences().bilingualMode || "zh-en";
    setBilingualMode(mode);
  }, [locale]);

  useEffect(() => {
    setThemeId(initialThemeId || verseOfDay.themeId || "dawn");
    setTemplateId(safeTemplateId(initialTemplateId || verseOfDay.templateId));
    setBgVariation(0);
    lastBgItemId.current = undefined;
  }, [
    initialThemeId,
    initialTemplateId,
    verseOfDay.themeId,
    verseOfDay.templateId,
  ]);

  // 语言切换时预取英文，预览同步
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (bilingualMode === "zh") {
        setDisplayVerse(verseOfDay.verse);
        return;
      }
      const v = await ensureEnglish(verseOfDay.verse, {
        timeoutMs: bilingualMode === "en" ? 6000 : 3500,
      });
      if (!cancelled) setDisplayVerse(v);
    })();
    return () => {
      cancelled = true;
    };
  }, [verseOfDay.verse, bilingualMode]);

  const regenerate = useCallback(
    async (variation: number) => {
      const seq = ++genSeq.current;
      setBusy(true);
      const activeThemeId = themeId || "dawn";
      pushStatus(
        manualRegen.current
          ? { kind: "swapping", themeId: activeThemeId }
          : bilingualMode === "en"
            ? { kind: "generatingEn" }
            : { kind: "generating" },
      );
      try {
        let verse = verseOfDay.verse;
        if (bilingualMode === "en" || bilingualMode === "zh-en") {
          verse = await ensureEnglish(verse, {
            timeoutMs: bilingualMode === "en" ? 7000 : 4000,
          });
          setDisplayVerse(verse);
        }

        const vod: VerseOfDay = {
          ...verseOfDay,
          verse,
          themeId: activeThemeId,
          templateId: safeTemplateId(templateId),
        };

        const excludeId = manualRegen.current
          ? lastBgItemId.current
          : undefined;

        const generated = await generateVerseImage({
          verseOfDay: vod,
          sizeName: sizeName || "story",
          themeId: vod.themeId,
          templateId: vod.templateId,
          bilingualMode,
          showBrandWatermark: true,
          bgVariation: variation,
          ...(excludeId ? { excludeBgItemId: excludeId } : {}),
        });

        if (seq !== genSeq.current) return;

        setResult(generated);
        if (generated.bgItemId) {
          lastBgItemId.current = generated.bgItemId;
        }

        const doneThemeId = generated.meta.themeId || activeThemeId;
        const enOk = hasEnglish(verse) || Boolean(verse.en?.text);
        if (bilingualMode === "en" && !enOk) {
          pushStatus({
            kind: "enNeedNet",
            themeId: doneThemeId,
            mode: bilingualMode,
          });
        } else if (generated.backgroundKind === "photo") {
          pushStatus(
            manualRegen.current
              ? { kind: "doneSwap", themeId: doneThemeId }
              : {
                  kind: "done",
                  themeId: doneThemeId,
                  mode: bilingualMode,
                },
          );
        } else {
          pushStatus({
            kind: "doneGradient",
            themeId: doneThemeId,
            mode: bilingualMode,
          });
        }

        if (saveHistory) {
          try {
            upsertHistory({
              verseOfDay: vod,
              lastMeta: generated.meta,
              savedAt: new Date().toISOString(),
            });
          } catch (histErr) {
            console.warn("history save skipped", histErr);
          }
          try {
            await putGeneratedImage(vod.id, generated.blob);
          } catch (imgErr) {
            console.warn("image cache skipped", imgErr);
          }
        }
      } catch (err) {
        console.error("[VerseStudio] generate failed", err);
        if (seq !== genSeq.current) return;
        setResult(null);
        pushStatus(
          err instanceof Error
            ? { kind: "fail", extra: err.message }
            : { kind: "fail" },
        );
      } finally {
        manualRegen.current = false;
        if (seq === genSeq.current) setBusy(false);
      }
    },
    [
      verseOfDay,
      sizeName,
      themeId,
      templateId,
      bilingualMode,
      saveHistory,
      pushStatus,
    ],
  );

  useEffect(() => {
    void regenerate(bgVariation);
  }, [regenerate, bgVariation]);

  useEffect(() => {
    setCollected(isCollected(verseOfDay.verse.id));
  }, [verseOfDay.verse.id]);

  const onDownload = async () => {
    if (!result) return;
    setBusy(true);
    pushStatus({ kind: "saving" });
    try {
      // 优先用最新 canvas 再导出，避免 blob 为空
      let blob = result.blob;
      if (!blob || blob.size < 64) {
        blob = await new Promise<Blob>((resolve, reject) => {
          result.canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error(t("studio.saveFail")))),
            "image/png",
          );
        });
      }
      const mode = await downloadBlob(
        blob,
        `jinju_${verseOfDay.date}_${sizeName}.png`,
      );
      pushStatus({
        kind:
          mode === "native"
            ? "savedNative"
            : mode === "web"
              ? "savedWeb"
              : "savedLongpress",
      });
    } catch (e) {
      console.error(e);
      pushStatus(
        e instanceof Error
          ? { kind: "saveFail", extra: e.message }
          : { kind: "saveFail" },
      );
    } finally {
      setBusy(false);
    }
  };

  const onShare = () => {
    if (!result) return;
    setShareOpen(true);
  };

  const onFavorite = () => {
    const next = toggleCollection({
      verse: verseOfDay.verse,
      verseOfDayId: verseOfDay.id,
    });
    setCollected(next.collected);
    pushStatus({ kind: next.collected ? "favAdded" : "favRemoved" });
  };

  const onRegenerateClick = () => {
    manualRegen.current = true;
    pushStatus({ kind: "swapping", themeId: themeId || "dawn" });
    setBgVariation((v) => v + 1);
  };

  const onThemeChange = (id: string) => {
    manualRegen.current = false;
    lastBgItemId.current = undefined;
    setThemeId(id);
    setBgVariation(0);
  };

  const themes = listThemes();
  const templates = listFreeTemplates();
  const isHero = variant === "hero";

  return (
    <div className={isHero ? "card preview-card hero" : "card preview-card"}>
      {!isHero ? (
        <div className="gen-meta">
          {dailyAutoNote ? (
            <span className="mini-tag fruit">{dailyAutoNote}</span>
          ) : (
            <span className="mini-tag">{t("today.localRender")}</span>
          )}
        </div>
      ) : dailyAutoNote ? (
        <div className="gen-meta">
          <span className="mini-tag">{dailyAutoNote}</span>
        </div>
      ) : null}

      {!isHero ? (
        <div className="bilingual-preview">
          {(bilingualMode === "zh" || bilingualMode === "zh-en") && (
            <p className="verse-body" style={{ margin: "0 0 0.5rem" }}>
              {displayVerse.text}
            </p>
          )}
          {(bilingualMode === "en" || bilingualMode === "zh-en") && (
            <p className="en-body">
              {displayVerse.en?.text ||
                (bilingualMode === "en"
                  ? "Loading English… / Offline: open network for WEB translation"
                  : "")}
            </p>
          )}
        </div>
      ) : null}

      <div className="preview-frame">
        {result ? (
          <img
            src={result.dataUrl}
            alt={`${verseOfDay.verse.reference} 金句图`}
            className={`preview-img size-${sizeName}`}
          />
        ) : (
          <div className="preview-placeholder">
            {busy ? <div className="preview-skeleton" aria-hidden /> : null}
            <p style={{ margin: busy ? "0.75rem 0 0" : 0 }}>
              {busy ? t("studio.generating") : status || t("studio.ready")}
            </p>
          </div>
        )}
      </div>

      <div className="actions primary-row">
        <button
          type="button"
          className="btn primary"
          onClick={() => void onDownload()}
          disabled={!result || busy}
        >
          {t("studio.save")}
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={onShare}
          disabled={!result || busy}
          style={{
            background: "transparent",
            color: "var(--accent)",
            border: "1.5px solid var(--accent)",
          }}
        >
          {t("studio.share")}
        </button>
      </div>

      <div className="actions secondary-row lang-row">
        <button
          type="button"
          className={`btn ghost compact${bilingualMode === "zh" ? " active-toggle" : ""}`}
          onClick={() => {
            setBilingualMode("zh");
            updatePreferences({ bilingualMode: "zh" });
          }}
          disabled={busy}
        >
          {t("studio.zh")}
        </button>
        <button
          type="button"
          className={`btn ghost compact${bilingualMode === "zh-en" ? " active-toggle" : ""}`}
          onClick={() => {
            setBilingualMode("zh-en");
            updatePreferences({ bilingualMode: "zh-en" });
          }}
          disabled={busy}
        >
          {t("studio.zhEn")}
        </button>
        <button
          type="button"
          className={`btn ghost compact${bilingualMode === "en" ? " active-toggle" : ""}`}
          onClick={() => {
            setBilingualMode("en");
            updatePreferences({ bilingualMode: "en" });
            pushStatus({ kind: "generatingEn" });
          }}
          disabled={busy}
        >
          {t("studio.en")}
        </button>
        {showFavorite ? (
          <button
            type="button"
            className="btn ghost compact"
            onClick={onFavorite}
            disabled={busy}
          >
            {collected ? t("studio.favorited") : t("studio.favorite")}
          </button>
        ) : null}
        <button
          type="button"
          className="btn ghost compact"
          onClick={onRegenerateClick}
          title={t("studio.swap")}
        >
          {busy ? t("studio.swapping") : t("studio.swap")}
        </button>
        <button
          type="button"
          className={`btn ghost compact${editorOpen ? " active-toggle" : ""}`}
          onClick={() => setEditorOpen((o) => !o)}
          aria-expanded={editorOpen}
        >
          {editorOpen ? t("studio.adjustClose") : t("studio.adjust")}
        </button>
      </div>

      {status ? (
        <p
          className={
            statusMeta.current.kind === "fail" ||
            statusMeta.current.kind === "saveFail"
              ? "status-line error"
              : statusMeta.current.kind === "done" ||
                  statusMeta.current.kind === "doneSwap" ||
                  statusMeta.current.kind === "doneGradient" ||
                  statusMeta.current.kind === "favAdded" ||
                  statusMeta.current.kind === "savedNative" ||
                  statusMeta.current.kind === "savedWeb" ||
                  statusMeta.current.kind === "savedLongpress"
                ? "status-line ok"
                : "status-line"
          }
        >
          {status}
        </p>
      ) : null}

      {editorOpen ? (
        <div className="editor-panel">
          <div className="controls controls-4">
            <label className="field">
              <span>{t("studio.language")}</span>
              <select
                value={bilingualMode}
                onChange={(e) => {
                  const v = e.target.value as BilingualMode;
                  setBilingualMode(v);
                  updatePreferences({ bilingualMode: v });
                  pushStatus({
                    kind: v === "en" ? "generatingEn" : "generating",
                    mode: v,
                  });
                }}
              >
                <option value="zh-en">{t("settings.verse.zhEn")}</option>
                <option value="zh">{t("settings.verse.zh")}</option>
                <option value="en">{t("settings.verse.en")}</option>
              </select>
            </label>

            <label className="field">
              <span>{t("studio.theme")}</span>
              <select
                value={themeId}
                onChange={(e) => onThemeChange(e.target.value)}
              >
                {themes.map((th) => (
                  <option key={th.id} value={th.id}>
                    {themeName(th.id)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t("studio.layout")}</span>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(safeTemplateId(e.target.value))}
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {templateName(tpl.id)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t("studio.size")}</span>
              <select
                value={sizeName}
                onChange={(e) => {
                  const v = e.target.value as ImageSizeName;
                  setSizeName(v);
                  updatePreferences({ defaultSize: v });
                }}
              >
                <option value="story">{t("settings.size.story")}</option>
                <option value="square">{t("settings.size.square")}</option>
                <option value="landscape">{t("settings.size.landscape")}</option>
              </select>
            </label>
          </div>
          <p className="muted small" style={{ margin: 0, textAlign: "center" }}>
            {t("settings.library.hint")}
          </p>
        </div>
      ) : null}

      {result ? (
        <ShareSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          blob={result.blob}
          dataUrl={result.dataUrl}
          filename={`jinju_${verseOfDay.date}_${sizeName}.png`}
          verse={verseOfDay.verse}
          mode={bilingualMode}
        />
      ) : null}
    </div>
  );
}
