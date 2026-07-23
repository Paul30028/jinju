import { useState } from "react";
import CollectionPage from "./CollectionPage";
import HistoryPage from "./HistoryPage";
import SettingsPage from "./SettingsPage";
import { useI18n } from "@/core/i18n";

type MeTab = "history" | "collection" | "settings";

/** 我的：历史 · 收藏 · 设置 */
export default function MePage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<MeTab>("history");

  return (
    <section className="me-stack" aria-label={t("nav.me")}>
      <div className="segmented" role="tablist" aria-label={t("nav.me")}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "history"}
          className={tab === "history" ? "active" : undefined}
          onClick={() => setTab("history")}
        >
          {t("me.history")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "collection"}
          className={tab === "collection" ? "active" : undefined}
          onClick={() => setTab("collection")}
        >
          {t("me.collection")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "settings"}
          className={tab === "settings" ? "active" : undefined}
          onClick={() => setTab("settings")}
        >
          {t("me.settings")}
        </button>
      </div>
      {tab === "history" ? (
        <HistoryPage />
      ) : tab === "collection" ? (
        <CollectionPage />
      ) : (
        <SettingsPage />
      )}
    </section>
  );
}
