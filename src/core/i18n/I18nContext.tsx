import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadPreferences, updatePreferences } from "../storage";
import { getBrand } from "../brand";
import type { AppLocale, MessageKey } from "./locales";
import {
  APP_LOCALES,
  localeTag,
  templateLabel,
  themeLabel,
  topicLabel,
  translate,
} from "./locales";

interface I18nContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: MessageKey) => string;
  themeName: (themeId: string) => string;
  templateName: (templateId: string) => string;
  topicName: (topicId: string) => string;
  dateLocale: string;
  locales: typeof APP_LOCALES;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const SEED_KEY = "serein-locale-seeded";

function normalizeLocale(raw: unknown): AppLocale {
  if (raw === "en" || raw === "de" || raw === "fr" || raw === "zh") return raw;
  return "zh";
}

function applyDocumentLang(locale: AppLocale) {
  try {
    document.documentElement.lang = localeTag(locale);
  } catch {
    // ignore
  }
}

/** 软件语言 ↔ 成图语言默认联动 */
function verseModeForLocale(locale: AppLocale): "zh" | "en" | "zh-en" {
  if (locale === "zh") return "zh";
  return "en";
}

function buildValue(
  locale: AppLocale,
  setLocale: (locale: AppLocale) => void,
): I18nContextValue {
  return {
    locale,
    setLocale,
    t: (key: MessageKey) => translate(locale, key),
    themeName: (id: string) => themeLabel(locale, id),
    templateName: (id: string) => templateLabel(locale, id),
    topicName: (id: string) => topicLabel(locale, id),
    dateLocale: localeTag(locale),
    locales: APP_LOCALES,
  };
}

function resolveInitialLocale(): AppLocale {
  const brand = getBrand();
  const brandDefault = brand.defaultLocale;
  const stored = normalizeLocale(loadPreferences().appLocale);

  try {
    const seededFor = localStorage.getItem(SEED_KEY);
    // 新区域构建首次打开：用该区域默认语言（cn→zh，intl→en）
    if (seededFor !== brand.region) {
      updatePreferences({
        appLocale: brandDefault,
        bilingualMode: verseModeForLocale(brandDefault),
      });
      localStorage.setItem(SEED_KEY, brand.region);
      return brandDefault;
    }
  } catch {
    // ignore storage errors
  }
  return stored;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    const initial = resolveInitialLocale();
    applyDocumentLang(initial);
    return initial;
  });

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    updatePreferences({
      appLocale: next,
      bilingualMode: verseModeForLocale(next),
    });
    applyDocumentLang(next);
  }, []);

  const value = useMemo(
    () => buildValue(locale, setLocale),
    [locale, setLocale],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const locale = normalizeLocale(loadPreferences().appLocale);
    return buildValue(locale, () => undefined);
  }
  return ctx;
}
