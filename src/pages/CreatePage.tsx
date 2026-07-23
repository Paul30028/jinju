import { useMemo, useState } from "react";
import { createCustomVerse, selectVerseOfDay } from "@/core/verse";
import { getTodayKey } from "@/core/scheduler";
import { loadPreferences } from "@/core/storage";
import VerseStudio from "@/components/VerseStudio";
import type { VerseOfDay } from "@/core/types";
import { useI18n } from "@/core/i18n";

export default function CreatePage() {
  const { t } = useI18n();
  const prefs = useMemo(() => loadPreferences(), []);
  const [text, setText] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [vod, setVod] = useState<VerseOfDay | null>(null);

  const onGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const verse = createCustomVerse({ text, reference });
      const date = getTodayKey(prefs.timezone);
      const next: VerseOfDay = {
        id: `custom_${date}_${verse.id}`,
        date,
        verse,
        themeId: prefs.themeId,
        templateId: prefs.defaultTemplateId,
        createdAt: new Date().toISOString(),
      };
      setVod(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("create.error"));
      setVod(null);
    }
  };

  const fillTodaySample = () => {
    const today = selectVerseOfDay({ timezone: prefs.timezone });
    setText(today.verse.text);
    setReference(today.verse.reference);
    setError("");
  };

  return (
    <section className="today" aria-labelledby="create-title">
      <div className="card">
        <span className="badge">{t("create.badge")}</span>
        <h2 id="create-title">{t("create.title")}</h2>
        <p className="muted">{t("create.intro")}</p>

        <form className="create-form" onSubmit={onGenerate}>
          <label className="field">
            <span>{t("create.ref")}</span>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t("create.refPh")}
              className="text-input"
            />
          </label>
          <label className="field">
            <span>{t("create.body")}</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("create.bodyPh")}
              rows={5}
              className="text-input"
            />
          </label>
          <div className="actions">
            <button type="submit" className="btn primary">
              {t("create.submit")}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={fillTodaySample}
            >
              {t("create.fillToday")}
            </button>
          </div>
          {error ? <p className="status-line error">{error}</p> : null}
        </form>
      </div>

      {vod ? (
        <>
          <div className="card today-text">
            <span className="badge">{t("common.preview")}</span>
            <h2 className="verse-ref">{vod.verse.reference}</h2>
            <p className="verse-body">{vod.verse.text}</p>
          </div>
          <VerseStudio
            key={vod.id}
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
