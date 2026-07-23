import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ensureEnglish, selectVerseOfDay } from "@/core/verse";
import { getFruitOfDay } from "@/core/verse/topics";
import { pickDailyPresentation } from "@/core/theme";
import { loadPreferences } from "@/core/storage";
import VerseStudio from "@/components/VerseStudio";
import { useI18n } from "@/core/i18n";
import type { BilingualMode, Verse } from "@/core/types";

/** 今日：单焦点 — 经文 + 大图 + 保存/分享 */
export default function TodayPage() {
  const { t, locale, themeName, templateName, topicName } = useI18n();
  const prefs = useMemo(() => loadPreferences(), [locale]);
  const auto = prefs.autoDailyLayout !== false;

  // 成图语言严格跟随偏好；切软件语言时 setLocale 会自动改 bilingualMode
  const verseMode: BilingualMode =
    prefs.bilingualMode || (locale === "zh" ? "zh" : "en");

  const verseOfDay = useMemo(() => {
    try {
      return selectVerseOfDay({
        timezone: prefs.timezone || "Asia/Shanghai",
        autoLayout: auto,
        ...(!auto
          ? {
              themeId: prefs.themeId,
              templateId: prefs.defaultTemplateId,
            }
          : {}),
      });
    } catch (e) {
      console.error("selectVerseOfDay failed", e);
      return selectVerseOfDay({
        timezone: "Asia/Shanghai",
        autoLayout: true,
      });
    }
  }, [prefs, auto]);

  const dailyStyle = useMemo(
    () => pickDailyPresentation(verseOfDay.date),
    [verseOfDay.date],
  );

  const fruit = useMemo(() => getFruitOfDay(), []);
  const themeLabel = themeName(dailyStyle.themeId);
  const layoutLabel = templateName(dailyStyle.templateId);
  const styleNote = `${themeLabel} · ${layoutLabel}`;

  const [displayVerse, setDisplayVerse] = useState<Verse>(verseOfDay.verse);
  const [enLoading, setEnLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const needEn = verseMode === "en" || verseMode === "zh-en";

    void (async () => {
      if (!needEn) {
        setDisplayVerse(verseOfDay.verse);
        setEnLoading(false);
        return;
      }
      setEnLoading(true);
      const v = await ensureEnglish(verseOfDay.verse, {
        timeoutMs: verseMode === "en" ? 7000 : 4000,
      });
      if (!cancelled) {
        setDisplayVerse(v);
        setEnLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [verseOfDay.verse, verseMode, locale]);

  /**
   * 严格模式（切换语言自动对齐）：
   * - en  → 只英文（出处/正文/译本标签都不带中文）
   * - zh  → 只中文
   * - zh-en → 双语，主语言随界面：中文界面中文优先，其它英文优先
   */
  const onlyEn = verseMode === "en";
  const onlyZh = verseMode === "zh";
  const bilingual = verseMode === "zh-en";
  const enPrimary = onlyEn || (bilingual && locale !== "zh");

  const enRef =
    displayVerse.en?.reference ||
    displayVerse.referenceEn ||
    null;
  const zhRef = displayVerse.reference;
  const enText = displayVerse.en?.text?.trim() || "";
  const zhText = displayVerse.text;

  // 纯英文模式绝不用中文出处占位
  const primaryRef = enPrimary
    ? enRef || (enLoading ? "…" : onlyEn ? "—" : zhRef)
    : zhRef;
  // 仅双语时显示第二种出处；纯英文/纯中文绝不混搭
  const secondaryRef =
    bilingual && enRef && zhRef && enRef !== zhRef
      ? enPrimary
        ? zhRef
        : enRef
      : null;

  const primaryText = enPrimary
    ? enText ||
      (enLoading
        ? t("studio.generatingEn")
        : onlyEn
          ? t("studio.enNeedNet")
          : zhText)
    : zhText;

  const secondaryText =
    bilingual && enText
      ? enPrimary
        ? zhText
        : enText
      : null;

  // 译本标签：纯英文只 ESV；纯中文只 CUV；双语才两者
  const translationLabel = onlyEn
    ? enText
      ? "ESV"
      : "ESV…"
    : onlyZh
      ? t("common.cuv")
      : enText
        ? `${t("common.cuv")} · ESV`
        : t("common.cuv");

  return (
    <section className="today" aria-labelledby="today-title">
      <div className="card today-hero" key={`hero-${locale}-${verseMode}`}>
        <span className="badge">{verseOfDay.date}</span>
        <h2 id="today-title" className="verse-ref">
          {primaryRef}
          {secondaryRef ? (
            <span className="ref-en"> · {secondaryRef}</span>
          ) : null}
        </h2>
        <p
          className={
            enPrimary && enText ? "en-body" : "verse-body"
          }
        >
          {primaryText}
        </p>
        {secondaryText ? (
          <p className={enPrimary ? "verse-body" : "en-body"}>
            {secondaryText}
          </p>
        ) : null}
        <p className="muted meta-line">
          {translationLabel}
          {" · "}
          {styleNote}
        </p>
      </div>

      <VerseStudio
        key={`${verseOfDay.id}_${locale}_${verseMode}`}
        verseOfDay={{
          ...verseOfDay,
          verse: displayVerse,
        }}
        initialSize={prefs.defaultSize}
        initialThemeId={verseOfDay.themeId}
        initialTemplateId={verseOfDay.templateId}
        variant="hero"
        dailyAutoNote={styleNote}
      />

      <div className="today-soft-links">
        <Link href="/explore" className="soft-link">
          {t("today.meditation")}: {topicName(fruit.fruit)}
        </Link>
        <Link href="/create" className="soft-link">
          {t("today.createCustom")}
        </Link>
      </div>
    </section>
  );
}
