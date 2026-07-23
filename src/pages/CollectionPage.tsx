import { useMemo, useState } from "react";
import {
  listCollection,
  removeFromCollection,
  type CollectionRecord,
} from "@/core/storage";
import { useI18n } from "@/core/i18n";

export default function CollectionPage() {
  const { t, dateLocale } = useI18n();
  const [tick, setTick] = useState(0);
  const items = useMemo(() => {
    void tick;
    return listCollection();
  }, [tick]);

  const remove = (verseId: string) => {
    removeFromCollection(verseId);
    setTick((n) => n + 1);
  };

  return (
    <section className="card" aria-labelledby="collection-title">
      <div className="row-between">
        <div>
          <span className="badge">{t("collection.badge")}</span>
          <h2 id="collection-title">{t("collection.title")}</h2>
        </div>
        <button
          type="button"
          className="btn ghost compact"
          onClick={() => setTick((n) => n + 1)}
        >
          {t("common.refresh")}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="muted">{t("collection.empty")}</p>
      ) : (
        <ul className="history-list">
          {items.map((item) => (
            <CollectionItemRow
              key={item.id}
              item={item}
              dateLocale={dateLocale}
              removeLabel={t("collection.remove")}
              onRemove={() => remove(item.verseId)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CollectionItemRow({
  item,
  dateLocale,
  removeLabel,
  onRemove,
}: {
  item: CollectionRecord;
  dateLocale: string;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <li className="history-item">
      <div className="history-thumb placeholder" aria-hidden />
      <div>
        <p className="history-date">
          {new Date(item.createdAt).toLocaleDateString(dateLocale)}
        </p>
        <p className="history-ref">{item.verse.reference}</p>
        <p className="history-text">{item.verse.text}</p>
        <button
          type="button"
          className="btn ghost compact"
          style={{ marginTop: "0.4rem" }}
          onClick={onRemove}
        >
          {removeLabel}
        </button>
      </div>
    </li>
  );
}
