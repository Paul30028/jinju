import { Route, Switch, Link, useLocation, Redirect } from "wouter";
import { useEffect } from "react";
import TodayPage from "./pages/TodayPage";
import ExplorePage from "./pages/ExplorePage";
import CreatePage from "./pages/CreatePage";
import MePage from "./pages/MePage";
import TopicsPage from "./pages/TopicsPage";
import LectionaryPage from "./pages/LectionaryPage";
import CollectionPage from "./pages/CollectionPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import { initColorScheme } from "./core/theme";
import { useI18n } from "./core/i18n";
import { getBrand } from "./core/brand";

function BottomNav() {
  const [loc] = useLocation();
  const { t } = useI18n();

  const tabs = [
    { href: "/", label: t("nav.today"), icon: "◎", match: (p: string) => p === "/" },
    {
      href: "/explore",
      label: t("nav.explore"),
      icon: "✦",
      match: (p: string) =>
        p.startsWith("/explore") ||
        p.startsWith("/topics") ||
        p.startsWith("/lectionary"),
    },
    {
      href: "/create",
      label: t("nav.create"),
      icon: "✎",
      match: (p: string) => p.startsWith("/create"),
    },
    {
      href: "/me",
      label: t("nav.me"),
      icon: "◌",
      match: (p: string) =>
        p.startsWith("/me") ||
        p.startsWith("/collection") ||
        p.startsWith("/history") ||
        p.startsWith("/settings"),
    },
  ] as const;

  return (
    <nav className="bottom-nav" aria-label={t("nav.main")}>
      {tabs.map((tab) => {
        const active = tab.match(loc);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? "bottom-nav-link active" : "bottom-nav-link"}
            aria-current={active ? "page" : undefined}
          >
            <span className="bottom-nav-icon" aria-hidden>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function App() {
  const { locale } = useI18n();
  const brand = getBrand();
  useEffect(() => initColorScheme(), []);

  // 顶栏品牌名/副标题：双版本差异化（不跟死旧「金句日」文案）
  const tagline =
    brand.tagline[locale] ||
    brand.tagline[brand.defaultLocale] ||
    brand.tagline.en;

  return (
    <div
      className={`app-shell region-${brand.region}`}
      lang={locale === "zh" ? "zh-CN" : locale}
      data-region={brand.region}
      data-brand={brand.masterBrand}
    >
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <h1 className="brand-title">{brand.displayName}</h1>
            <p className="brand-sub">{tagline}</p>
          </div>
        </div>
      </header>

      {/* key=locale：切换软件语言时整页重挂载，避免局部 state 残留中文 */}
      <main className="app-main" key={locale}>
        <Switch>
          <Route path="/" component={TodayPage} />
          <Route path="/explore" component={ExplorePage} />
          <Route path="/create" component={CreatePage} />
          <Route path="/me" component={MePage} />
          <Route path="/topics" component={TopicsPage} />
          <Route path="/lectionary" component={LectionaryPage} />
          <Route path="/collection" component={CollectionPage} />
          <Route path="/history" component={HistoryPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </main>

      <BottomNav />
    </div>
  );
}
