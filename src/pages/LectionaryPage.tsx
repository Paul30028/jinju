import { useMemo, useState } from "react";
import {
  getReadingsForDate,
  readingToVerse,
  type LectionaryReading,
} from "@/core/lectionary";
import type { VerseOfDay } from "@/core/types";
import { getTodayKey } from "@/core/scheduler";
import { loadPreferences } from "@/core/storage";
import VerseStudio from "@/components/VerseStudio";
import { useI18n } from "@/core/i18n";

export default function LectionaryPage() {
  const { t } = useI18n();
  const prefs = useMemo(() => loadPreferences(), []);
  const pack = useMemo(() => getReadingsForDate(), []);
  const [active, setActive] = useState<LectionaryReading | null>(
    pack.readings[0] ?? null,
  );

  const vod: VerseOfDay | null = active
    ? {
        id: `rcl_${pack.year}_${pack.weekKey}_${active.reference}`,
        date: getTodayKey(prefs.timezone),
        verse: readingToVerse(active),
        themeId: prefs.themeId,
        templateId: prefs.defaultTemplateId,
        createdAt: new Date().toISOString(),
      }
    : null;

  return (
    <section className="today" aria-labelledby="rcl-title">
      <div className="card">
        <span className="badge">{t("lectionary.badge")}</span>
        <h2 id="rcl-title">{pack.title}</h2>
        <p className="muted">
          {pack.label}
          {!pack.exact ? ` · ${t("lectionary.extend")}` : ""}
        </p>
        <p className="meta-line muted">
          {t("lectionary.year")} <strong>{pack.year}</strong> · {pack.seasonLabel}{" "}
          · <code>{pack.weekKey}</code>
        </p>

        <ul className="verse-pick-list" style={{ marginTop: "1rem" }}>
          {pack.readings.map((r) => (
            <li key={`${r.slot}-${r.reference}`}>
              <button
                type="button"
                className={
                  active?.reference === r.reference && active.slot === r.slot
                    ? "verse-pick active"
                    : "verse-pick"
                }
                onClick={() => setActive(r)}
              >
                <span className="mini-tag">{r.slot}</span>
                <span className="history-ref">{r.reference}</span>
                <span className="history-text">{r.text}</span>
              </button>
            </li>
          ))}
        </ul>

        <p className="muted small" style={{ marginTop: "0.75rem" }}>
          {t("lectionary.note")}
        </p>
      </div>

      {vod ? (
        <>
          <div className="card today-text">
            <span className="badge">
              {active?.slot} · {t("lectionary.year")} {pack.year}
            </span>
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
