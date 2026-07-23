/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_TRANSLATION: string;
  readonly VITE_BIBLE_API_BASE: string;
  readonly VITE_ENABLE_AI_BG: string;
  readonly VITE_BG_CATALOG_URL: string;
  readonly VITE_BG_CATALOG_URL_BACKUP: string;
  /** 品牌区域：cn = 中国区 Serein 静澄；intl = 国际区 Serein */
  readonly VITE_APP_REGION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
