import { useState } from "react";
import TopicsPage from "./TopicsPage";
import LectionaryPage from "./LectionaryPage";
import { useI18n } from "@/core/i18n";

type ExploreTab = "topics" | "lectionary";

/** 探索：主题经文 + 经课（合并原顶栏两项） */
export default function ExplorePage() {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<ExploreTab>("topics");

  return (
    <section className="explore-page" aria-label={t("nav.explore")}>
      <div className="segmented" role="tablist" aria-label={t("nav.explore")}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "topics"}
          className={tab === "topics" ? "active" : undefined}
          onClick={() => setTab("topics")}
        >
          {t("explore.topics")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "lectionary"}
          className={tab === "lectionary" ? "active" : undefined}
          onClick={() => setTab("lectionary")}
        >
          {t("explore.lectionary")}
        </button>
      </div>
      {tab === "topics" ? (
        <TopicsPage key={`topics-${locale}`} />
      ) : (
        <LectionaryPage key={`rcl-${locale}`} />
      )}
    </section>
  );
}
