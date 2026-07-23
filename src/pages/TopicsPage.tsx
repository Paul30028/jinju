import { useEffect, useMemo, useState } from "react";
import {
  FRUIT_TOPICS,
  LIFE_TOPICS,
  countByTopic,
  getFruitOfDay,
  listVersesByTopic,
} from "@/core/verse/topics";
import type { BilingualMode, SpiritualTopic, Verse, VerseOfDay } from "@/core/types";
import { getTodayKey } from "@/core/scheduler";
import { loadPreferences } from "@/core/storage";
import { attachEnglish, ensureEnglish } from "@/core/verse";
import VerseStudio from "@/components/VerseStudio";
import { translate, useI18n } from "@/core/i18n";

export default function TopicsPage() {
  const { t, locale, topicName } = useI18n();
  // 随软件语言重读偏好（切语言后 App 会 remount，这里再保险一次）
  const prefs = useMemo(() => loadPreferences(), [locale]);
  const verseMode: BilingualMode =
    prefs.bilingualMode || (locale === "zh" ? "zh-en" : "en");

  const fruitToday = useMemo(() => getFruitOfDay(), []);
  const [topic, setTopic] = useState<SpiritualTopic | "all">(fruitToday.fruit);
  const [active, setActive] = useState<Verse | null>(null);
  const [list, setList] = useState<Verse[]>(() =>
    listVersesByTopic(topic).map(attachEnglish),
  );

  // 主题列表：按成图语言挂英文
  useEffect(() => {
    let cancelled = false;
    const base = listVersesByTopic(topic).map(attachEnglish);
    setList(base);

    if (verseMode === "zh") return;

    void (async () => {
      const next: Verse[] = [];
      for (const v of base) {
        if (cancelled) return;
        next.push(
          await ensureEnglish(v, {
            timeoutMs: verseMode === "en" ? 5000 : 2500,
          }),
        );
      }
      if (!cancelled) setList(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [topic, verseMode, locale]);

  const vod: VerseOfDay | null = active
    ? {
        id: `topic_${active.id}`,
        date: getTodayKey(prefs.timezone),
        verse: active,
        themeId: prefs.themeId,
        templateId: prefs.defaultTemplateId,
        createdAt: new Date().toISOString(),
      }
    : null;

  const selectTopic = (next: SpiritualTopic | "all") => {
    setTopic(next);
    setActive(null);
  };

  const fruitLabel = topicName(fruitToday.fruit);

  // 标题/说明：严格跟软件语言 t()
  // 经文介绍：跟成图语言（中 / 英 / 中英双语）
  const fruitSectionTitle = t("topics.fruitSection");
  const introZh = translate("zh", "topics.fruitIntro");
  const introEn = translate("en", "topics.fruitIntro");
  const refZh = translate("zh", "topics.fruitRef");
  const refEn = translate("en", "topics.fruitRef");

  const showZhIntro = verseMode === "zh" || verseMode === "zh-en";
  const showEnIntro = verseMode === "en" || verseMode === "zh-en";
  // 德/法软件语言时，成图若是 en，介绍用英文（无德/法经文库）
  const showUiIntro = locale === "de" || locale === "fr";

  const showZhVerse = verseMode === "zh" || verseMode === "zh-en";
  const showEnVerse = verseMode === "en" || verseMode === "zh-en";
  const enPrimary = verseMode === "en";

  return (
    <section className="today" aria-labelledby="topics-title">
      <div className="card">
        <span className="badge">{t("topics.badge")}</span>
        <h2 id="topics-title">{t("topics.title")}</h2>
        <p className="muted">{t("topics.intro")}</p>

        <div className="fruit-banner" key={`banner-${locale}-${verseMode}`}>
          <p className="fruit-banner-kicker">{t("topics.fruitToday")}</p>
          <p className="fruit-banner-title">{fruitLabel}</p>
          <p className="muted small" style={{ margin: 0 }}>
            {enPrimary ? refEn : refZh}
            {verseMode === "zh-en" ? ` · ${enPrimary ? refZh : refEn}` : ""}
            {" · "}
            {t("topics.fruitHint")}
          </p>
          <button
            type="button"
            className="btn ghost compact"
            style={{ marginTop: "0.55rem" }}
            onClick={() => selectTopic(fruitToday.fruit)}
          >
            {t("topics.viewFruit")}
          </button>
        </div>

        {/* 九果标题：软件语言；经文介绍：成图语言（中/英） */}
        <p className="section-label" key={`sec-${locale}`}>
          {fruitSectionTitle}
        </p>
        <div key={`intro-${locale}-${verseMode}`} className="fruit-intro-block">
          {/* 德/法界面额外显示本地化一句说明 */}
          {showUiIntro ? (
            <p className="muted small fruit-intro">{t("topics.fruitIntro")}</p>
          ) : null}
          {showZhIntro ? (
            <p className="muted small fruit-intro">
              <span className="mini-tag" style={{ marginRight: "0.35rem" }}>
                {refZh}
              </span>
              {introZh}
            </p>
          ) : null}
          {showEnIntro ? (
            <p className="muted small fruit-intro en-body">
              <span className="mini-tag" style={{ marginRight: "0.35rem" }}>
                {refEn}
              </span>
              {introEn}
            </p>
          ) : null}
        </div>

        <div
          className="chip-row"
          role="list"
          aria-label={fruitSectionTitle}
          key={`chips-fruit-${locale}`}
        >
          {FRUIT_TOPICS.map((id) => (
            <button
              key={id}
              type="button"
              className={topic === id ? "chip active fruit" : "chip fruit"}
              onClick={() => selectTopic(id)}
              title={`${topicName(id)} · ${countByTopic(id)} ${t("topics.count")}`}
            >
              {topicName(id)}
              <span className="chip-count">{countByTopic(id)}</span>
            </button>
          ))}
        </div>

        <p className="section-label">{t("topics.lifeSection")}</p>
        <div
          className="chip-row"
          role="list"
          aria-label={t("topics.lifeSection")}
          key={`chips-life-${locale}`}
        >
          <button
            type="button"
            className={topic === "all" ? "chip active" : "chip"}
            onClick={() => selectTopic("all")}
          >
            {t("common.all")}
          </button>
          {LIFE_TOPICS.map((id) => (
            <button
              key={id}
              type="button"
              className={topic === id ? "chip active" : "chip"}
              onClick={() => selectTopic(id)}
              title={`${topicName(id)} · ${countByTopic(id)} ${t("topics.count")}`}
            >
              {topicName(id)}
              <span className="chip-count">{countByTopic(id)}</span>
            </button>
          ))}
        </div>

        <p className="muted small" style={{ marginBottom: "0.5rem" }}>
          {topic === "all"
            ? `${t("topics.countAll")} ${list.length} ${t("topics.count")}`
            : `「${topicName(topic)}」· ${list.length} ${t("topics.count")}`}
        </p>

        <ul className="verse-pick-list" key={`list-${locale}-${verseMode}-${topic}`}>
          {list.map((v) => {
            const primaryText = enPrimary
              ? v.en?.text || v.text
              : v.text;
            const secondaryText = enPrimary
              ? showZhVerse && v.en?.text
                ? v.text
                : null
              : showEnVerse
                ? v.en?.text || null
                : null;
            const primaryRef = enPrimary
              ? v.en?.reference || v.referenceEn || v.reference
              : v.reference;

            return (
              <li key={v.id}>
                <button
                  type="button"
                  className={
                    active?.id === v.id ? "verse-pick active" : "verse-pick"
                  }
                  onClick={() => setActive(v)}
                >
                  <span className="history-ref">{primaryRef}</span>
                  <span className={enPrimary && v.en ? "en-body history-text" : "history-text"}>
                    {primaryText}
                  </span>
                  {secondaryText ? (
                    <span
                      className={
                        enPrimary ? "history-text" : "en-body history-text"
                      }
                      style={{ display: "block", marginTop: "0.25rem" }}
                    >
                      {secondaryText}
                    </span>
                  ) : null}
                  <span className="tag-row">
                    {(v.topics ?? []).map((tid) => (
                      <span
                        key={tid}
                        className={
                          FRUIT_TOPICS.includes(tid)
                            ? "mini-tag fruit"
                            : "mini-tag"
                        }
                      >
                        {topicName(tid)}
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {list.length === 0 ? (
          <p className="muted">{t("topics.empty")}</p>
        ) : null}
      </div>

      {vod ? (
        <>
          <div className="card today-text">
            <span className="badge">{t("common.generate")}</span>
            <h2 className="verse-ref">{vod.verse.reference}</h2>
            <p className="verse-body">{vod.verse.text}</p>
            {vod.verse.en?.text ? (
              <p className="en-body">{vod.verse.en.text}</p>
            ) : null}
          </div>
          <VerseStudio
            key={`${vod.id}_${locale}_${verseMode}`}
            verseOfDay={vod}
            initialSize={prefs.defaultSize}
            initialThemeId={prefs.themeId}
            initialTemplateId={prefs.defaultTemplateId}
          />
        </>
      ) : null}
    </section>
  );
}
