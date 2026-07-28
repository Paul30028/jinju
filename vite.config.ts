import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

function resolveRegion(raw?: string): "cn" | "intl" {
  const v = (raw || "").trim().toLowerCase();
  if (v === "intl" || v === "international" || v === "global") return "intl";
  return "cn";
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const region = resolveRegion(env.VITE_APP_REGION || process.env.VITE_APP_REGION);
  const isIntl = region === "intl";

  const name = isIntl ? "Serein" : "Serein 静澄";
  const shortName = isIntl ? "Serein" : "静澄";
  const description = isIntl
    ? "One quiet line a day — make, save, share."
    : "Serein 静澄 — 每日一句，安静成图，可保存分享。";
  const themeColor = isIntl ? "#0e2a3a" : "#1a3a38";
  const backgroundColor = isIntl ? "#f4f7f8" : "#f5f2ec";
  const favicon = isIntl ? "brand/favicon-intl.svg" : "brand/favicon-cn.svg";
  const lang = isIntl ? "en" : "zh-CN";

  return {
    // Capacitor / Android WebView 必须用相对路径
    base: "./",
    define: {
      "import.meta.env.VITE_APP_REGION": JSON.stringify(region),
    },
    plugins: [
      react(),
      {
        name: "serein-index-html-brand",
        transformIndexHtml(html) {
          return html
            .replace(/lang="[^"]*"/, `lang="${lang}"`)
            .replace(/<title>[^<]*<\/title>/, `<title>${name}</title>`)
            .replace(
              /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
              `<meta name="description" content="${description}" />`,
            )
            .replace(
              /<meta\s+name="theme-color"\s+content="[^"]*"\s*\/>/,
              `<meta name="theme-color" content="${themeColor}" />`,
            )
            .replace(
              /href="\/(?:favicon\.svg|brand\/favicon-[a-z]+\.svg)"/,
              `href="/${favicon}"`,
            );
        },
      },
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "brand/favicon-cn.svg",
          "brand/favicon-intl.svg",
          favicon,
        ],
        manifest: {
          name,
          short_name: shortName,
          description,
          theme_color: themeColor,
          background_color: backgroundColor,
          display: "standalone",
          lang,
          start_url: "./",
          icons: [
            {
              src: favicon,
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          cleanupOutdatedCaches: true,
          globPatterns: ["**/*.{js,css,html,svg,woff2,png,jpg,webp}"],
          navigateFallback: null,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 5173,
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
    },
  };
});
