import type { CapacitorConfig } from "@capacitor/cli";

/** 中国区 Serein 静澄 */
const config: CapacitorConfig = {
  appId: "app.serein.cn",
  appName: "Serein 静澄",
  webDir: "dist",
  server: { androidScheme: "https" },
  android: {
    allowMixedContent: false,
    backgroundColor: "#f5f2ec",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#f5f2ec",
      showSpinner: false,
    },
  },
};

export default config;
