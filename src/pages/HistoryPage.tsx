import { useEffect, useMemo, useState } from "react";
import {
  clearHistory,
  getThumbObjectUrl,
  listHistory,
  loadPreferences,
  removeGeneratedImage,
  removeHistoryById,
  type HistoryEntry,
} from "@/core/storage";
import VerseStudio from "@/components/VerseStudio";
import { useI18n } from "@/core/i18n";

function HistoryThumb({ id }: { id: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    void (async () => {
      const u = await getThumbObjectUrl(id);
      if (cancelled) {
        if (u) URL.revokeObjectURL(u);
        return;
      }
      url = u;
      setSrc(u);
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  if (!src) {
    return <div className="history-thumb placeholder" aria-hidden />;
  }
  return (
    <img className="history-thumb" src={src} alt="" loading="lazy" />
  );
}

export default function HistoryPage() {
  const { t } = useI18n();
  const prefs = useMemo(() => loadPreferences(), []);
  const [tick, setTick] = useState(0);
  const [active, setActive] = useState<HistoryEntry | null>(null);
  const entries = useMemo(() => {
    void tick;
    return listHistory();
  }, [tick]);

  const refresh = () => {
    setTick((n) => n + 1);
    setActive(null);
  };

  return (
    <section className="today" aria-labelledby="history-title">
      <div className="card">
        <div className="row-between">
          <div>
            <span className="badge">{t("history.badge")}</span>
            <h2 id="history-title">{t("history.title")}</h2>
          </div>
          <div className="actions">
            <button type="button" className="btn ghost compact" onClick={refresh}>
              {t("common.refresh")}
            </button>
            {entries.length > 0 ? (
              <button
                type="button"
                className="btn ghost compact"
                onClick={() => {
                  if (confirm(t("history.clearConfirm"))) {
                    for (const e of entries) {
                      void removeGeneratedImage(e.verseOfDay.id);
                    }
                    clearHistory();
                    refresh();
                  }
                }}
              >
                {t("common.clear")}
              </button>
            ) : null}
          </div>
        </div>

        {entries.length === 0 ? (
          <p className="muted">{t("history.empty")}</p>
        ) : (
          <ul className="history-list grid-view">
            {entries.map((entry) => (
              <li key={entry.verseOfDay.id} className="history-item">
                <HistoryThumb id={entry.verseOfDay.id} />
                <div className="history-body">
                  <p className="history-date">{entry.verseOfDay.date}</p>
                  <p className="history-ref">
                    {entry.verseOfDay.verse.reference}
                  </p>
                  <p className="history-text">{entry.verseOfDay.verse.text}</p>
                  <div className="actions" style={{ marginTop: "0.4rem" }}>
                    <button
                      type="button"
                      className="btn ghost compact"
                      onClick={() => setActive(entry)}
                    >
                      {t("common.open")}
                    </button>
                    <button
                      type="button"
                      className="btn ghost compact"
                      onClick={() => {
                        void removeGeneratedImage(entry.verseOfDay.id);
                        removeHistoryById(entry.verseOfDay.id);
                        refresh();
                      }}
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {active ? (
        <div className="card">
          <span className="badge">{active.verseOfDay.date}</span>
          <h2 className="verse-ref">{active.verseOfDay.verse.reference}</h2>
          <p className="verse-body">{active.verseOfDay.verse.text}</p>
          <VerseStudio
            key={active.verseOfDay.id}
            verseOfDay={active.verseOfDay}
            initialSize={prefs.defaultSize}
            initialThemeId={active.verseOfDay.themeId}
            initialTemplateId={active.verseOfDay.templateId}
            variant="full"
          />
        </div>
      ) : null}
    </section>
  );
}
